import axios from 'axios';

/** Production uses same-origin /api proxy (vercel.json) — no CORS preflight on PATCH. */
function resolveBaseUrl() {
    const env = import.meta.env.VITE_API_URL;
    if (import.meta.env.PROD) {
        if (!env || env.includes('onrender.com')) return '/api';
        return env;
    }
    return env || 'http://localhost:4000/api';
}

const BASE_URL = resolveBaseUrl();
// Render free tier cold starts can take 30–60s; local dev stays fast
const DEFAULT_TIMEOUT = import.meta.env.PROD ? 90000 : 15000;

const client = axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,
});

// Retry once on timeout when backend is waking up (Render free tier)
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        if (
            error.code === 'ECONNABORTED'
            && config
            && !config.__retry
            && import.meta.env.PROD
        ) {
            config.__retry = true;
            config.timeout = 120000;
            return client.request(config);
        }
        return Promise.reject(error);
    }
);

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
    getInsights: (params) => client.get('/insights', { params }),
    getWeather: (params) => client.get('/weather', { params }),
    getLocations: () => client.get('/users/locations'),
    updateProfile: (data) => client.patch('/users/me', data),
    getProfile: () => client.get('/users/me'),
    login: (data) => client.post('/auth/login', data),
    register: (data) => client.post('/auth/register', data),
    health: () => client.get('/health'),
};

export default client;
