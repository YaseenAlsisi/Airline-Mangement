import React, { useState, useEffect } from 'react';
import { systemSettingsApi } from '../../../api/settingsApi';

const SystemSettingsTab = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await systemSettingsApi.getAllSettings();
      
      // Convert list of { key, value } to an object map
      const settingsMap = {};
      const dataList = Array.isArray(response) ? response : (response.data || []);
      dataList.forEach(s => {
        settingsMap[s.settingKey] = s.settingValue;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load system settings', error);
      setMessage('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Save each setting one by one (or adjust if backend has a bulk update endpoint)
      for (const [key, value] of Object.entries(settings)) {
        await systemSettingsApi.updateSetting(key, value);
      }
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">System Configuration</h2>
        <p className="text-slate-500 mt-1">Manage global application settings and regional formats.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {message && (
          <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">System Name</label>
            <input 
              type="text" 
              name="SYSTEM_NAME"
              value={settings['SYSTEM_NAME'] || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Default Currency</label>
            <select 
              name="DEFAULT_CURRENCY"
              value={settings['DEFAULT_CURRENCY'] || 'USD'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Timezone</label>
            <select 
              name="TIMEZONE"
              value={settings['TIMEZONE'] || 'UTC'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-200 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsTab;
