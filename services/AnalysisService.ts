import { api } from './api';
import { DB } from './db';

export const AnalysisService = {
    fetchIdeaAnalysisFromServer: async (workspaceId: string) => {
        const analysis = await api.getIdeaAnalysis(workspaceId);
        if (analysis) {
            DB.setItem('ideaAnalysis', analysis);
        }
        return analysis;
    },

    createOrUpdateFounderAlignment: (orgId: string) => {
        return api.createFounderAlignment(orgId);
    },

    createOrUpdateAnalysis: (orgId: string) => {
        return api.createIdeaAnalysis(orgId);
    },

    createOrUpdateInvestorReadiness: (orgId: string) => {
        return api.createInvestorReadiness(orgId);
    },

    getInvestorReadiness: (orgId: string) => {
        return api.getInvestorReadiness(orgId);
    },

    getFounderAlignment: (orgId: string) => {
        return api.getFounderAlignment(orgId);
    },

    getIdeaAnalysis: (orgId: string) => {
        return api.getIdeaAnalysis(orgId);
    },
};