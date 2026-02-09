import { DB } from './db';
import { api } from './api';
import { User, Workspace } from '../types';
import { WorkspaceService } from './WorkspaceService';
import { TeamService } from './TeamService';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let userListeners: ((user: User | null) => void)[] = [];

export const AuthService = {
  getCachedUser: (): User | null => {
    if (!AuthService.isSessionValid()) {
      AuthService.logout();
      return null;
    }
    return DB.getItem<User | null>('user', null);
  },

  setCurrentWorkspace: async (workspace: Workspace): Promise<void> => {
    // 1. Persist change to user profile
    await AuthService.updateUser({ current_org_id: workspace.id });

    // 2. Update local workspace & Notify
    WorkspaceService.setWorkspaceAndNotify(workspace);

    // 3. Sync roles for this new workspace
    await AuthService.syncState();
  },

  syncState: async (): Promise<void> => {
    const user = AuthService.getCachedUser();
    if (!user) return;

    try {
      // 1. Sync Workspaces
      const workspaces = await api.getWorkspaces(user.email);

      let activeWorkspace: Workspace | null = null;

      if (user.current_org_id) {
        // @ts-ignore
        activeWorkspace = workspaces.find((w: Workspace) => w.id === user.current_org_id) || null;
      }

      if (activeWorkspace) {
        WorkspaceService.setWorkspaceAndNotify(activeWorkspace);
      }

      console.log("in sync state", activeWorkspace);

      // 2. Sync Role from user-org-info
      if (user && user.current_org_id) {
        // Use TeamService to fetch user org info
        const orgInfo = await TeamService.getUserOrgInfo(user.id, user.current_org_id);

        if (orgInfo?.role) {
          DB.setItem('UserOrgInfo', orgInfo.role);
        }
      }

    } catch (e) {
      console.error("Failed to sync state from backend", e);
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    const user = await api.login({ email, password });
    console.log("in login", user)
    DB.setItem('user', user);
    AuthService.refreshSession();

    // Fetch initial state
    await AuthService.syncState();

    return user as unknown as User;
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    if (!AuthService.isSessionValid()) {
      AuthService.logout();
      return null;
    }
    const user = await api.getUserByEmail(email);
    if (user) {
      DB.setItem('user', user);
    }
    return user as unknown as User | null;
  },

  signup: async (fullName: string, email: string, password: string): Promise<User> => {
    try {
      // 1. Create User
      const user = await api.signup({ fullName, email, password, status: "Active" });
      if (!user) throw new Error("Signup failed");

      // 2. Create Workspace
      const ws = await api.createWorkspace(email);
      
      // Update local cache
      DB.setItem('user', user);
      
      // 3. Set Current Workspace
      await AuthService.setCurrentWorkspace(ws as Workspace);

      // 4. Get Updated User Info
      const userOrgInfo = await TeamService.getUserOrgInfo(user.id, ws.id);
      
      if (userOrgInfo) {
          // Update the user object with org info
          // @ts-ignore
          user.permission_level = userOrgInfo.permission_level;
          // @ts-ignore
          user.role = userOrgInfo.role;
          // @ts-ignore
          user.equity = userOrgInfo.equity;
          // @ts-ignore
          user.vesting = userOrgInfo.vesting;
          // @ts-ignore
          user.commitment = userOrgInfo.commitment;
          // @ts-ignore
          user.status = userOrgInfo.status;
          user.current_org_id = ws.id;
          
          DB.setItem('user', user);
      }

      AuthService.refreshSession();
      await AuthService.syncState();

      return user as unknown as User;

    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  googleSignup: async (email: string): Promise<User> => {
    const user = await api.googleSignup(email);
    DB.setItem('user', user);
    AuthService.refreshSession();

    // Fetch initial state
    await AuthService.syncState();

    return user as unknown as User;
  },

  getInvestorReadiness: async (orgId: string) => {
    return api.getInvestorReadiness(orgId);
  },

  createOrUpdateInvestorReadiness: async (orgId: string) => {
    return api.createInvestorReadiness(orgId);
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('workspace');
    localStorage.removeItem('UserOrgInfo');
    localStorage.removeItem('lastActivity');
  },

  refreshSession: () => {
    localStorage.setItem('lastActivity', Date.now().toString());
  },

  isSessionValid: (): boolean => {
    const lastActivity = localStorage.getItem('lastActivity');
    const user = localStorage.getItem('user');
    if (!lastActivity || !user) return false;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
    return timeSinceLastActivity < SESSION_TIMEOUT;
  },

  async updateUser(data: Partial<User>) {
    const current = AuthService.getCachedUser();
    if (!current) return null;

    const updatedUser = await api.updateUser(current.email, data);

    // 🔥 update local cache
    DB.setItem('user', updatedUser);

    // 🔔 notify listeners
    AuthService.notifyUserChange(updatedUser as unknown as User);

    return updatedUser as unknown as User;
  },

  onUserChange(cb: (user: User | null) => void) {
    userListeners.push(cb);
    return () => {
      userListeners = userListeners.filter(l => l !== cb);
    };
  },

  notifyUserChange(user: User | null) {
    userListeners.forEach(cb => cb(user));
  },
};