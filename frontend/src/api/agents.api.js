import apiClient from './client';

export const getAgents = (params) => apiClient.get('/api/v1/agents', { params });
export const getAgent = (id) => apiClient.get(`/api/v1/agents/${id}`);
export const createAgent = (data) => apiClient.post('/api/v1/agents', data);
export const updateAgent = (id, data) => apiClient.put(`/api/v1/agents/${id}`, data);