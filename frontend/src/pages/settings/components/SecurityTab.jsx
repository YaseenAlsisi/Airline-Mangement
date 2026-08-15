import React, { useState, useEffect } from 'react';
import { securitySettingsApi } from '../../../api/settingsApi';

const SecurityTab = () => {
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
      const response = await securitySettingsApi.getAllSettings();
      
      const settingsMap = {};
      const dataList = Array.isArray(response) ? response : (response.data || []);
      dataList.forEach(s => {
        settingsMap[s.settingKey] = s.settingValue;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load security settings', error);
      setMessage('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? (e.target.checked ? 'true' : 'false') : e.target.value;
    setSettings({
      ...settings,
      [e.target.name]: value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      for (const [key, value] of Object.entries(settings)) {
        await securitySettingsApi.updateSetting(key, value);
      }
      setMessage('Security settings saved successfully!');
    } catch (error) {
      console.error('Failed to save security settings', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading security configurations...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Security & Compliance</h2>
        <p className="text-slate-500 mt-1">Configure password policies, session timeouts, and access controls.</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {message && (
          <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Password Policy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Minimum Password Length</label>
              <input 
                type="number" 
                name="MIN_PASSWORD_LENGTH"
                value={settings['MIN_PASSWORD_LENGTH'] || '8'}
                onChange={handleChange}
                className="mt-1 block w-24 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            
            <div className="flex items-center pt-2">
              <input
                id="REQUIRE_SPECIAL_CHAR"
                name="REQUIRE_SPECIAL_CHAR"
                type="checkbox"
                checked={settings['REQUIRE_SPECIAL_CHAR'] === 'true'}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="REQUIRE_SPECIAL_CHAR" className="ml-2 block text-sm text-slate-700">
                Require at least one special character (!@#$%^&*)
              </label>
            </div>

            <div className="flex items-center pt-2">
              <input
                id="REQUIRE_UPPERCASE"
                name="REQUIRE_UPPERCASE"
                type="checkbox"
                checked={settings['REQUIRE_UPPERCASE'] === 'true'}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="REQUIRE_UPPERCASE" className="ml-2 block text-sm text-slate-700">
                Require at least one uppercase letter
              </label>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Session Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Idle Session Timeout (Minutes)</label>
              <select 
                name="SESSION_TIMEOUT_MINUTES"
                value={settings['SESSION_TIMEOUT_MINUTES'] || '30'}
                onChange={handleChange}
                className="mt-1 block w-48 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">Users will be automatically logged out after this period of inactivity.</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 transition shadow-sm font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Applying...' : 'Apply Security Policies'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
