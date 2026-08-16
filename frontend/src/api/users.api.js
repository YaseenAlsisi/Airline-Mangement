import apiClient from './client';

export const getAllUsers = (params) => apiClient.get('/api/v1/users', { params });
export const getUserById = (id) => apiClient.get(`/api/v1/users/${id}`);
export const createUser = (data) => apiClient.post('/api/v1/users', data);
export const updateUser = (id, data) => apiClient.put(`/api/v1/users/${id}`, data);
export const updateUserStatus = (id, active) => apiClient.patch(`/api/v1/users/${id}/status`, { active });
export const resetUserPassword = (id, newPassword) => apiClient.put(`/api/v1/users/${id}/password`, { newPassword });
export const deleteUser = (id) => apiClient.delete(`/api/v1/users/${id}`);
