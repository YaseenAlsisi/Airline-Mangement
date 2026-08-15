import apiClient from './client';

export const systemSettingsApi = {
  getAllSettings: () => 
    apiClient.get('/api/settings/system'),
    
  updateSetting: (key, value) => 
    apiClient.put(`/api/settings/system/${key}`, value, {
      headers: { 'Content-Type': 'text/plain' }
    }),
};

export const securitySettingsApi = {
  getAllSettings: () => 
    apiClient.get('/api/settings/security'),
    
  updateSetting: (key, value) => 
    apiClient.put(`/api/settings/security/${key}`, value, {
      headers: { 'Content-Type': 'text/plain' }
    }),
};

export const notificationSettingsApi = {
  getPreferences: (userId) => 
    apiClient.get(`/api/settings/notifications/${userId}`),
    
  updatePreference: (userId, key, value) => 
    apiClient.put(`/api/settings/notifications/${userId}/${key}`, value, {
      headers: { 'Content-Type': 'text/plain' }
    }),
};
