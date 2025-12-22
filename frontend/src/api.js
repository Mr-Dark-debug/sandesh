import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (username, password) => api.post('/auth/login', { username, password });
export const getUsers = () => api.get('/users');
export const createUser = (username, password) => api.post('/users', { username, password });
export const getFolders = () => api.get('/folders');
export const createFolder = (name) => api.post('/folders', null, { params: { name } });
export const getMail = (folderId) => api.get(`/mail/${folderId}`);
export const getMessage = (id) => api.get(`/message/${id}`);
export const moveMessage = (id, folderId) => api.put(`/message/${id}/move`, null, { params: { folder_id: folderId } });
export const sendMail = (data) => api.post('/mail/send', data);

export default api;
