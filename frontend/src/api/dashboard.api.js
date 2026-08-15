import apiClient from './client';

export const getDashboardSummary = async (startDate, endDate, agent, destination) => {
  let url = '/api/v1/dashboard/summary';
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (agent && agent !== 'all') params.append('agent', agent);
  if (destination && destination !== 'all') params.append('destination', destination);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return await apiClient.get(url);
};
