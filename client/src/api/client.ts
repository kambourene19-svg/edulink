import axios from 'axios';

const isProd = import.meta.env.PROD;
const apiURL = import.meta.env.VITE_API_URL || (isProd ? 'https://fasoticket-api.onrender.com/api' : 'http://localhost:3001/api');

const api = axios.create({
    baseURL: apiURL,
});

console.log('API Client initialized with URL:', apiURL);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
