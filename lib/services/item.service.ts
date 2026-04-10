import api from '../api';

export interface ItemFilters {
  type?: 'all' | 'lost' | 'found';
  category?: string;
  location?: string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ReportItemPayload {
  type: 'lost' | 'found';
  title: string;
  category: string;
  location: string;
  date: string;
  description: string;
  image?: File | null;
}

export const itemService = {
  async getAll(filters: ItemFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== 'all' && val !== 'All') {
        params.append(key, String(val));
      }
    });
    const { data } = await api.get(`/item?${params.toString()}`);
    return data.data; // { items, total, page, totalPages }
  },

  async getMy() {
    const { data } = await api.get('/item/my');
    return data.data.items;
  },

  async getById(id: string) {
    const { data } = await api.get(`/item/${id}`);
    return data.data.item;
  },

  async report(payload: ReportItemPayload) {
    const form = new FormData();
    form.append('type',        payload.type);
    form.append('title',       payload.title);
    form.append('category',    payload.category);
    form.append('location',    payload.location);
    form.append('date',        payload.date);
    form.append('description', payload.description);
    if (payload.image) form.append('image', payload.image);

    const { data } = await api.post('/item', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.item;
  },

  async updateStatus(id: string, status: string) {
    const { data } = await api.patch(`/item/${id}/status`, { status });
    return data.data.item;
  },

  async delete(id: string) {
    await api.delete(`/item/${id}`);
  },
};