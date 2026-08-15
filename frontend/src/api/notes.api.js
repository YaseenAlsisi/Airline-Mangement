import apiClient from './client';

export const getNotes = (params) => apiClient.get('/api/v1/notes', { params });
export const createNote = (data) => apiClient.post('/api/v1/notes', data);
export const deleteNote = (id) => apiClient.delete(`/api/v1/notes/${id}`);