import { api } from './api';
import { Dashboard } from '../types';

export const DashboardService = {
    getDashboard: async (orgId: string): Promise<{ size: number; dashboard: Dashboard } | null> => {
        const res = await api.getDashboard(orgId);
        // Map the result to match the expected return type
        if (!res || !res.dashboard) return null;
        
        return {
            size: res.size,
            dashboard: res.dashboard as unknown as Dashboard
        };
    },

    updateDashboard: async (orgId: string): Promise<any> => {
        return await api.updateDashboard(orgId);
    },
};