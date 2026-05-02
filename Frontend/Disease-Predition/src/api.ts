import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});


api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Only clear credentials on genuine 401 responses from the server,
        // NOT on network errors (which have no err.response at all).
        // Also skip auth endpoints — login/register 401s are handled in Auth.tsx.
        const url = err.config?.url || '';
        const isAuthEndpoint = url.includes('/login') || url.includes('/register');

        if (err.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export const register = (name: string, email: string, password: string) =>
    api.post('/register', { name, email, password });

export const login = (email: string, password: string) =>
    api.post('/login', { email, password });

export const getMe = () => api.get('/me');

export const getHistory = () => api.get('/history');

export const predict = (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/predict', form);
};

export const diagnose = (file: File, lat: number, lon: number) =>  {
    const form = new FormData();
    form.append('image', file);
    form.append('latitude', lat.toString());
    form.append('longitude', lon.toString());
    return api.post('/diagnose', form);
};

export default api;

