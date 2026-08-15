import apiClient from './client';

export const usersApi = {
  getAllUsers: (page = 0, size = 10) => 
    apiClient.get(`/api/v1/users?page=${page}&size=${size}`),
    
  getUserById: (id) => 
    apiClient.get(`/api/v1/users/${id}`),
    
  createUser: (userData) => 
    apiClient.post('/api/v1/users', userData),
    
  updateUser: (id, userData) => 
    apiClient.put(`/api/v1/users/${id}`, userData),
    
  updateUserStatus: (id, isActive) => apiClient.patch(`/api/v1/users/${id}/status`, { isActive }),
    
  resetPassword: (id, newPassword) => 
    apiClient.put(`/api/v1/users/${id}/password`, { newPassword }),
    
  deleteUser: (id) =>
    apiClient.delete(`/api/v1/users/${id}`),
};

export const rolesApi = {
  getAllRoles: () => 
    apiClient.get('/api/v1/roles'),
    
  getRoleById: (id) => 
    apiClient.get(`/api/v1/roles/${id}`),
    
  createRole: (roleData) => 
    apiClient.post('/api/v1/roles', roleData),
    
  updateRole: (id, roleData) => 
    apiClient.put(`/api/v1/roles/${id}`, roleData),
    
  assignPermissions: (id, permissionIds) => 
    apiClient.put(`/api/v1/roles/${id}/permissions`, { permissionIds }),
    
  getAllPermissions: () => 
    apiClient.get('/api/v1/roles/permissions'),
};

export const myAccountApi = {
  getProfile: () => 
    apiClient.get('/api/v1/my-account'),
    
  updateProfile: (profileData) => 
    apiClient.put('/api/v1/my-account', profileData),
    
  changePassword: (passwordData) => 
    apiClient.put('/api/v1/my-account/password', passwordData),
};
