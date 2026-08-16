import apiClient from './client';

export const getNotifications = (params) => apiClient.get('/api/v1/notifications', { params });
export const getUnreadNotificationCount = () => apiClient.get('/api/v1/notifications/unread-count');
export const markNotificationAsRead = (id) => apiClient.post(`/api/v1/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => apiClient.post('/api/v1/notifications/read-all');
