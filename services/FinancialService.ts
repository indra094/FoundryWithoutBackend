import { api } from './api';
import { Financials } from '../types';

export const FinancialService = {
    getFinancials: async (orgId: string): Promise<Financials | null> => {
        const res = await api.getFinancials(orgId);
        return res as unknown as Financials | null;
    },

    updateFinancials: async (orgId: string, data: Financials): Promise<Financials> => {
        const res = await api.updateFinancials(orgId, data);
        return res as unknown as Financials;
    },
};