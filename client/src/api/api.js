import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/login', credentials);
export const signup = (userData) => api.post('/signup', userData);
export const getAdminCredits = () => api.get('/admin/credits');
export const createAdminCredit = (creditData) => api.post('/admin/credits', creditData);
export const getBuyerCredits = () => api.get('/buyer/credits');
export const purchaseCredit = (purchaseData) => api.post('/buyer/purchase', purchaseData);
export const sellCreditApi = (sellData) => api.patch('/buyer/sell', sellData);
export const removeSaleCreditApi = (removeData) => api.patch('/buyer/remove-from-sale', removeData);
export const getPurchasedCredits = () => api.get('/buyer/purchased');
export const getTransactions = () => api.get('/admin/transactions');
export const generateCertificate = (creditId) => api.get(`/buyer/generate-certificate/${creditId}`);
export const downloadCertificate = (creditId) => api.get(`/buyer/download-certificate/${creditId}`);
export const expireCreditApi = (expireCreditId) => api.patch(`/admin/credits/expire/${expireCreditId}`);

export default api;
