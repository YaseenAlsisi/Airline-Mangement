import apiClient from './client';

export const getBalanceReport = (ticketPrice) => 
    apiClient.get(`/api/v1/agents/balance-report`, { params: { ticketPrice } });

export const getAgentTransactions = (agentId, params) =>
    apiClient.get(`/api/v1/agents/${agentId}/transactions`, { params });

export const addAgentTransaction = (agentId, data) =>
    apiClient.post(`/api/v1/agents/${agentId}/transactions`, data);

export const recordAgentPayment = (agentId, data) =>
    apiClient.post(`/api/v1/agents/${agentId}/payments`, data);

export const exportBalanceReport = (ticketPrice) =>
    apiClient.get(`/api/v1/agents/balance-report/export`, { 
        params: { ticketPrice }, responseType: 'blob' 
    });

// Import management
export const getImportStatus = () =>
    apiClient.get('/api/v1/agent-accounts/import/status');

export const deleteImportData = (batchId) =>
    apiClient.delete(`/api/v1/agent-accounts/import/${batchId}`);

export const reseedData = () =>
    apiClient.post('/api/v1/agent-accounts/import/reseed');

export const uploadAgentAccountImport = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/v1/agent-accounts/import', formData, {
        timeout:600000 // 10 minutes
    });
};

