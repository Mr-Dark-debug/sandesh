import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Auth Endpoints
// ==========================================
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// ==========================================
// User Endpoints (Admin only)
// ==========================================
export const getUsers = () =>
  api.get('/users');

export const createUser = (username, password, displayName = null) =>
  api.post('/users', { username, password, display_name: displayName });

export const deactivateUser = (userId) =>
  api.delete(`/users/${userId}`);

// ==========================================
// User Profile Endpoints (Self-service)
// ==========================================
export const getMyProfile = () =>
  api.get('/users/me');

export const updateMyProfile = (data) =>
  api.put('/users/me', data);

// ==========================================
// System Settings (Admin only)
// ==========================================
export const getSystemSettings = () =>
  api.get('/system');

export const updateSystemSettings = (data) =>
  api.put('/system', data);

export const getNamespaceWarnings = (newNamespace) =>
  api.get(`/system/namespace-warnings`, { params: { new_namespace: newNamespace } });

// ==========================================
// Folder Endpoints
// ==========================================
export const getFolders = () =>
  api.get('/folders');

export const createFolder = (name) =>
  api.post('/folders', { name });

// ==========================================
// Mail Endpoints
// ==========================================
export const getMail = (folderId) =>
  api.get(`/mail/${folderId}`);

export const getMessage = (id) =>
  api.get(`/message/${id}`);

export const moveMessage = (emailId, folderId) =>
  api.put(`/message/${emailId}/move`, { folder_id: folderId });

export const sendMail = (data) =>
  api.post('/mail/send', data);

// ==========================================
// Health Check
// ==========================================
export const checkHealth = () =>
  api.get('/health');

export default api;
