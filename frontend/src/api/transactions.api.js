import apiClient from './client';

export const getTransactions = (params) => apiClient.get('/api/v1/transactions', { params });
export const getTransaction = (id) => apiClient.get(`/api/v1/transactions/${id}`);
export const createTransaction = (data) => apiClient.post('/api/v1/transactions', data);
export const updateTransaction = (id, data) => apiClient.put(`/api/v1/transactions/${id}`, data);