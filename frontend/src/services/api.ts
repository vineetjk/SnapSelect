import axios from 'axios';
import { AuthResponse, Client, Photo } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (email: string, password: string, studioName: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, studioName }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
};

// Clients API
export const clientsAPI = {
  create: (name: string, email?: string) =>
    api.post<Client>('/clients', { name, email }),

  getAll: () => api.get<Client[]>('/clients'),

  getByLink: (uniqueLink: string) =>
    api.get<Client>(`/clients/gallery/${uniqueLink}`),

  delete: (id: number) => api.delete(`/clients/${id}`),
};

// Photos API
export const photosAPI = {
  upload: (clientId: number, files: FileList) => {
    const formData = new FormData();
    formData.append('clientId', clientId.toString());
    Array.from(files).forEach((file) => {
      formData.append('photos', file);
    });
    return api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getByClient: (clientId: number) =>
    api.get<Photo[]>(`/photos/client/${clientId}`),

  getByLink: (uniqueLink: string) =>
    api.get<Photo[]>(`/photos/gallery/${uniqueLink}`),

  toggleSelection: (photoId: number) =>
    api.patch(`/photos/${photoId}/select`),

  delete: (photoId: number) => api.delete(`/photos/${photoId}`),

  getDownloadUrl: (photoId: number, quality: string) =>
    `${API_BASE}/photos/download/${photoId}?quality=${quality}`,
};

// Favorites API
export const favoritesAPI = {
  toggle: (photoId: number, uniqueLink: string) =>
    api.post('/favorites/toggle', { photoId, uniqueLink }),

  getByLink: (uniqueLink: string) =>
    api.get<Photo[]>(`/favorites/${uniqueLink}`),
};
