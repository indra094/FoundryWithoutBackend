import { api } from './api';
import { DB } from './db';
import { Workspace } from '../types';

let workspaceChangeListeners: ((w: Workspace | null) => void)[] = [];

export const WorkspaceService = {
    getWorkspaces: async (email: string): Promise<Workspace[]> => {
        // @ts-ignore
        const res = await api.getWorkspaces(email);
        return (res as unknown as Workspace[]) || [];
    },

    fetchWorkspaceFromServer: async (workspaceId: string) => {
        const workspace = await api.getWorkspace(workspaceId);

        if (workspace) {
            DB.setItem('workspace', workspace);
        }
        return workspace as unknown as Workspace;
    },

    getCachedWorkspace: (): Workspace | null => {
        return DB.getItem<Workspace | null>('workspace', null);
    },

    createWorkspace: async (email: string): Promise<Workspace> => {
        const workspace = await api.createWorkspace(email);
        if (workspace) {
            DB.setItem('workspace', workspace);
        }
        return workspace as unknown as Workspace;
    },

    updateWorkspace: async (orgId: string, data: Partial<Workspace>) => {
        const updated = await api.updateWorkspace(orgId, data);

        // Notify listeners so UI updates immediately
        WorkspaceService.setWorkspaceAndNotify(updated as unknown as Workspace);

        return updated as unknown as Workspace;
    },

    setOnboarding: async (workspaceId: string, step: number) => {
        const data = await api.setOnboardingStep(workspaceId, step);
        console.log("[WorkspaceService] Set onboarding step:", step);
        // Notify listeners so UI updates immediately
        WorkspaceService.setWorkspaceAndNotify(data as unknown as Workspace);

        return data as unknown as Workspace;
    },

    onWorkspaceChange: (listener: (w: Workspace | null) => void) => {
        workspaceChangeListeners.push(listener);
        return () => {
            workspaceChangeListeners = workspaceChangeListeners.filter(l => l !== listener);
        };
    },

    setWorkspaceAndNotify: (w: Workspace | null) => {
        DB.setItem('workspace', w);
        console.log("🔥 Workspace set", w);
        workspaceChangeListeners.forEach(l => l(w));
    }
};