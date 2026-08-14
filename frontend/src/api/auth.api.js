import apiClient from './client';

export const login = (data) => apiClient.post('/api/v1/auth/login', data);
export const getMe = () => apiClient.get('/api/v1/auth/me');
export const logout = (refreshToken) => apiClient.post('/api/v1/auth/logout', { refreshToken });