import axiosInstance from './client';

const API_BASE = '/api/v1/manifest-imports';

export const previewManifestImport = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post(`${API_BASE}/preview`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const getBatches = async (params) => {
  const response = await axiosInstance.get(`${API_BASE}`, { params });
  return response;
};

export const getBatchPreview = async (batchId) => {
  const response = await axiosInstance.get(`${API_BASE}/${batchId}`);
  return response;
};

export const getManifestRows = async (batchId, params) => {
  const response = await axiosInstance.get(`${API_BASE}/${batchId}/rows`, { params });
  return response;
};

export const updateManifestRow = async (batchId, rowId, data) => {
  const response = await axiosInstance.put(`${API_BASE}/${batchId}/rows/${rowId}`, data);
  return response;
};

export const publishManifestImport = async (batchId) => {
  const response = await axiosInstance.post(`${API_BASE}/${batchId}/publish`);
  return response;
};

export const getAgentManifestSummary = async () => {
  const response = await axiosInstance.get(`/api/v1/agents/manifest-summary`);
  return response;
};

export const getAgentManifestPassengers = async (agentId, params) => {
  const response = await axiosInstance.get(`/api/v1/agents/${agentId}/manifest-passengers`, { params });
  return response;
};

export const getAllManifestPassengers = async (params) => {
  const response = await axiosInstance.get(`/api/v1/agents/all-manifest-passengers`, { params });
  return response;
};
