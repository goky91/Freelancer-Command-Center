import axios from 'axios';
import { AuthTokens, User, Client, TimeEntry, Invoice } from './types';

const API_URL = 'http://3.67.201.188/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor za dodavanje tokena
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor za refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
    return response.data;
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await axios.post(`${API_URL}/auth/register/`, data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};

// Clients API
export const clientsAPI = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients/');
    return response.data;
  },

  get: async (id: number): Promise<Client> => {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Client>): Promise<Client> => {
    const response = await api.post('/clients/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Client>): Promise<Client> => {
    const response = await api.put(`/clients/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}/`);
  },
};

// Time Entries API
export const timeEntriesAPI = {
  getAll: async (clientId?: number): Promise<TimeEntry[]> => {
    const params = clientId ? { client: clientId } : {};
    const response = await api.get('/time-entries/', { params });
    return response.data;
  },

  get: async (id: number): Promise<TimeEntry> => {
    const response = await api.get(`/time-entries/${id}/`);
    return response.data;
  },

  create: async (data: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await api.post('/time-entries/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await api.put(`/time-entries/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/time-entries/${id}/`);
  },
};

// Invoices API
export const invoicesAPI = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await api.get('/invoices/');
    return response.data;
  },

  get: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.post('/invoices/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/invoices/${id}/`);
  },

  downloadPDF: async (id: number): Promise<Blob> => {
    const response = await api.get(`/invoices/${id}/download_pdf/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  markAsSent: async (id: number): Promise<void> => {
    await api.post(`/invoices/${id}/mark_as_sent/`);
  },

  markAsPaid: async (id: number): Promise<void> => {
    await api.post(`/invoices/${id}/mark_as_paid/`);
  },
};

export default api;
