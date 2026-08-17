import apiClient from './client';

export const getDashboardData = (params) => {
  return apiClient.get('/api/v1/reports/dashboard', { params });
};