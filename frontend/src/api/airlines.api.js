import apiClient from './client';

export const getAirlines = (params) => apiClient.get('/api/v1/airlines', { params });
export const getAirline = (id) => apiClient.get(`/api/v1/airlines/${id}`);
export const createAirline = (data) => apiClient.post('/api/v1/airlines', data);
export const updateAirline = (id, data) => apiClient.put(`/api/v1/airlines/${id}`, data);