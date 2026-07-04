import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../lib/authStorage';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 15000
});

let refreshPromise = null;

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ||= http.post('/auth/refresh', { refreshToken }).then((res) => res.data.data).finally(() => {
      refreshPromise = null;
    });

    const tokens = await refreshPromise;
    setTokens(tokens);
    original.headers.Authorization = `Bearer ${tokens.accessToken}`;
    return http(original);
  }
);
