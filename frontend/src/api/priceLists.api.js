import apiClient from './client';

export const getPriceLists = (params) => apiClient.get('/api/v1/price-lists', { params });
export const getPriceList = (id) => apiClient.get(`/api/v1/price-lists/${id}`);
export const createPriceList = (data) => apiClient.post('/api/v1/price-lists', data);
export const updatePriceList = (id, data) => apiClient.put(`/api/v1/price-lists/${id}`, data);