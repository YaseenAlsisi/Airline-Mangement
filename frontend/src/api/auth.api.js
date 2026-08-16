import apiClient from './client';

export const login = (data) => apiClient.post('/api/v1/auth/login', data);
export const getMe = () => apiClient.get('/api/v1/auth/me');
export const logout = (refreshToken) => apiClient.post('/api/v1/auth/logout', { refreshToken });
export const updateProfile = (data) => apiClient.put('/api/v1/auth/me/profile', data);
export const changePassword = (data) => apiClient.put('/api/v1/auth/me/password', data);