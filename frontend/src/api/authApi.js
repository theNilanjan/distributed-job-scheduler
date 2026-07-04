import { http } from './http';

export const authApi = {
  login: (payload) => http.post('/auth/login', payload).then((res) => res.data.data),
  register: (payload) => http.post('/auth/register', payload).then((res) => res.data.data),
  refresh: (refreshToken) => http.post('/auth/refresh', { refreshToken }).then((res) => res.data.data),
  logout: (refreshToken) => http.post('/auth/logout', { refreshToken }).then((res) => res.data.data),
  me: () => http.get('/auth/me').then((res) => res.data.data)
};
