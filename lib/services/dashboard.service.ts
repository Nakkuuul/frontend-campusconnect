import api from '../api';

export const dashboardService = {
  async getStats() {
    const { data } = await api.get('/dashboard/stats');
    return data.data.stats; // { totalItems, resolvedThisMonth, pendingClaims, activeUsers }
  },

  async getRecoveryRates() {
    const { data } = await api.get('/dashboard/recovery-rates');
    return data.data.rates; // [{ category, total, resolved, rate }]
  },
};