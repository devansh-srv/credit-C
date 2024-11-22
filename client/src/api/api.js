import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request config:', config); // Debugging log
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Only clear auth and redirect for explicit auth errors
          if (error.response.data && error.response.data.error === 'invalid_token') {
            localStorage.clear();
            window.location.href = '/login';
          }
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('/login', credentials);
export const signup = (userData) => api.post('/signup', userData);
export const getAdminCredits = () => api.get('/admin/credits');
export const createAdminCredit = (creditData) => api.post('/admin/credits', creditData);
export const getBuyerCredits = () => api.get('/buyer/credits');
export const purchaseCredit = (purchaseData) => api.post('/buyer/purchase', purchaseData);
export const getPurchasedCredits = () => api.get('/buyer/purchased');
export const getTransactions = () => api.get('/admin/transactions');
export const generateCertificate = (purchaseId) => api.get(`/buyer/generate-certificate/${purchaseId}`);

export default api;