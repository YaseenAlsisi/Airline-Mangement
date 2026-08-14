import apiClient from './client';

export const getSalesSummary = (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return apiClient.get('/api/v1/reports/sales', { params });
};