import api from '../api';

export interface SubmitClaimPayload {
  itemId: string;
  answer1: string;
  answer2: string;
  proof?: string;
}

export const claimsService = {
  async submit(payload: SubmitClaimPayload) {
    const { data } = await api.post('/claims', payload);
    return data.data.claim;
  },

  async getMy() {
    const { data } = await api.get('/claims/my');
    return data.data.claims;
  },

  async getByItem(itemId: string) {
    const { data } = await api.get(`/claims/item/${itemId}`);
    return data.data.claims;
  },

  async getById(id: string) {
    const { data } = await api.get(`/claims/${id}`);
    return data.data.claim;
  },

  async review(id: string, status: 'approved' | 'rejected', notes?: string) {
    const { data } = await api.patch(`/claims/${id}/review`, { status, notes });
    return data.data.claim;
  },

  async withdraw(id: string) {
    await api.delete(`/claims/${id}`);
  },
};