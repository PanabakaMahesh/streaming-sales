import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// ── Products ─────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/seller/my', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ── Orders ───────────────────────────────────────────────────────────────
export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  getBuyerOrders: (params) => api.get('/orders/buyer', { params }),
  getSellerOrders: (params) => api.get('/orders/seller', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

// ── Sellers ──────────────────────────────────────────────────────────────
export const sellersAPI = {
  getAll: (params) => api.get('/sellers', { params }),
  getById: (id) => api.get(`/sellers/${id}`),
  getMyProfile: () => api.get('/sellers/me/profile'),
  updateProfile: (data) => api.put('/sellers/update', data),
};

// ── Streams ──────────────────────────────────────────────────────────────
export const streamsAPI = {
  getLive: (params) => api.get('/stream/live', { params }),
  getById: (id) => api.get(`/stream/${id}`),
  getMyStreams: () => api.get('/stream/seller/my'),
  create: (data) => api.post('/stream', data),
  start: (id) => api.post(`/stream/start/${id}`),
  stop: (id) => api.post(`/stream/stop/${id}`),
};

export default api;
