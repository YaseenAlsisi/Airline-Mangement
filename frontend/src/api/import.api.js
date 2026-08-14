import apiClient from './client';

export const importTransactions = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/api/v1/import/transactions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};