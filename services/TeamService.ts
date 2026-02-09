
import { api } from './api';
import { User } from '../types';

export const TeamService = {
    getUsersForOrg: async (orgId: string): Promise<User[]> => {
        const users = await api.getUsersForOrg(orgId);
        return (users as unknown as User[]) || [];
    },

    getUserOrgInfo: async (userId: string, orgId: string) => {
        const info = await api.getUserOrgInfo(userId, orgId);
        return info as any; // Cast to match expected structure
    },

    updateUserForOrg: async (
        userId: string,
        orgID: string,
        role: string,
        permission_level: string,
        equity: number,
        vesting: string,
        commitment: number,
        status?: string,
        salary?: number,
        bonus?: number
    ): Promise<User> => {
        await api.setUserOrgInfo({
            user_id: userId,
            org_id: orgID,
            role,
            permission_level,
            equity,
            vesting,
            commitment,
            ...(status !== undefined ? { status } : {}),
            ...(salary !== undefined ? { salary } : {}),
            ...(bonus !== undefined ? { bonus } : {}),
        });
        
        // Return refreshed user data if needed, or null. The UI mostly relies on reloading the list.
        // For compatibility we can return a placeholder or fetch the user.
        return {} as unknown as User;
    },

    createUserForOrg: async (fullName: string, email: string, orgID: string, status: string, role: string, permission_level: string, equity: number, vesting: string, commitment: number, salary: number, bonus: number): Promise<User> => {
        // api.createUser handles get-or-create logic
        const user = await api.createUser({ 
            fullName, 
            email, 
            org_id: orgID, 
            status: status,
            industry_experience: 0 
        });

        await api.setUserOrgInfo({
            user_id: user.id,
            org_id: orgID,
            role,
            permission_level,
            equity,
            vesting,
            commitment,
            ...(status !== undefined ? { status } : {}),
            ...(salary !== undefined ? { salary } : {}),
            ...(bonus !== undefined ? { bonus } : {}),
        });

        return user as unknown as User;
    },
    
    deleteUserFromOrgByEmail: async (orgId: string, email: string): Promise<{ status: string; message: string }> => {
        try {
            // @ts-ignore
            const response = await api.deleteUserFromOrgByEmail(orgId, email);
            return response;
        } catch (err: any) {
            console.error("Failed to delete user:", err);
            throw err;
        }
    },

    setUserOrgInfo: async (userId: string, orgId: string, permission_level: string, equity: number, vesting: string, commitment: number) => {
        return await api.setUserOrgInfo({
            user_id: userId,
            org_id: orgId,
            permission_level: permission_level,
            equity: equity,
            vesting: vesting,
            commitment: commitment,
            status: "Active",
        });
    },
};