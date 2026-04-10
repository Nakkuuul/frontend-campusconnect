import api from '../api';

export interface RegisterPayload {
  name: string;
  email: string;
  enrollment: string;
  password: string;
  role: 'student' | 'faculty' | 'staff';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload);
    // Persist token and user on success
    localStorage.setItem('cc_token', data.data.token);
    localStorage.setItem('cc_user',  JSON.stringify(data.data.user));
    return data.data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('cc_token', data.data.token);
    localStorage.setItem('cc_user',  JSON.stringify(data.data.user));
    return data.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    }
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('cc_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('cc_token');
  },
};