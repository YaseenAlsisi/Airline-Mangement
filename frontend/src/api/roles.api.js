import apiClient from './client';

export const getAllRoles = () => apiClient.get('/api/v1/roles');
export const getRoleById = (id) => apiClient.get(`/api/v1/roles/${id}`);
export const createRole = (data) => apiClient.post('/api/v1/roles', data);
export const updateRole = (id, data) => apiClient.put(`/api/v1/roles/${id}`, data);
export const assignPermissions = (id, permissionIds) => apiClient.put(`/api/v1/roles/${id}/permissions`, { permissionIds });
export const getAllPermissions = () => apiClient.get('/api/v1/roles/permissions');
export const deleteRole = (id) => apiClient.delete(`/api/v1/roles/${id}`);
