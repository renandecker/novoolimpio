import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080' });
api.interceptors.request.use(config => { const saved = localStorage.getItem('olimpio.session'); if (saved) { const session = JSON.parse(saved); if (session.expiresAt * 1000 > Date.now()) config.headers.Authorization = `Bearer ${session.accessToken}`; else localStorage.removeItem('olimpio.session'); } return config; });
