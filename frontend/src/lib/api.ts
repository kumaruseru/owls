import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refresh_token');
                if (refreshToken) {
                    // Corrected endpoint from /auth/token/refresh/ to /users/token/refresh/
                    const response = await axios.post(`${API_URL}/users/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    Cookies.set('access_token', access, { expires: 1 }); // 1 day

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } else {
                    // No refresh token available, force logout
                    throw new Error('No refresh token');
                }
            } catch (refreshError) {
                // Clear tokens on refresh failure or missing token
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');

                if (typeof window !== 'undefined') {
                    // Clear Zustand Persist Storage to ensure UI updates
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
