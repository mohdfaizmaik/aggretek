import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

// Auto-attach JWT token if available
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('agritech_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// API helpers
export const api = {
    getCommodities: (params) => client.get('/commodities', { params }),
    getMarkets: (params) => client.get('/markets', { params }),
    getPrices: (params) => client.get('/prices', { params }),
    getSparkline: (params) => client.get('/prices/sparkline', { params }),
    getMsp: (params) => client.get('/msp', { params }),
    getWatchlist: () => client.get('/watchlist'),
    addWatchlist: (data) => client.post('/watchlist', data),
    removeWatchlist: (id) => client.delete(`/watchlist/${id}`),
    login: (data) => client.post('/auth/login', data),
    register: (data) => client.post('/auth/register', data),
    health: () => client.get('/health'),
};

export default client;
