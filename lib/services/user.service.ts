import api from '../api';

export const userService = {
  async getProfile() {
    const { data } = await api.get('/user/profile');
    return data.data.user;
  },

  async updateProfile(payload: { name?: string; role?: string }) {
    const { data } = await api.patch('/user/profile', payload);
    return data.data.user;
  },

  async getNotifications() {
    const { data } = await api.get('/user/notifications');
    return data.data; // { notifications, unreadCount }
  },

  async markRead(id: string) {
    await api.patch(`/user/notifications/${id}/read`);
  },

  async markAllRead() {
    await api.patch('/user/notifications/read-all');
  },
};