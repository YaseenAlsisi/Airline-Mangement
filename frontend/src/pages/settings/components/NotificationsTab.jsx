import React, { useState, useEffect } from 'react';
import { notificationSettingsApi } from '../../../api/settingsApi';
import { useAuthStore } from '../../../store/authStore';

// Simple JWT decode function to avoid external dependency
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const NotificationsTab = () => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Extract userId from the user store
    const user = useAuthStore.getState().user;
    if (user && user.id) {
      setUserId(user.id);
      fetchPreferences(user.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPreferences = async (uid) => {
    try {
      setLoading(true);
      const response = await notificationSettingsApi.getPreferences(uid);
      
      const prefMap = {};
      const dataList = Array.isArray(response) ? response : (response.data || []);
      dataList.forEach(p => {
        prefMap[p.key] = p.value;
      });
      setPreferences(prefMap);
    } catch (error) {
      console.error('Failed to load notification preferences', error);
      setMessage('Failed to load preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences({
      ...preferences,
      [key]: preferences[key] === 'true' ? 'false' : 'true'
    });
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage('');
    try {
      for (const [key, value] of Object.entries(preferences)) {
        await notificationSettingsApi.updatePreference(userId, key, value);
      }
      setMessage('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences', error);
      setMessage('Failed to save preferences.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const ToggleSwitch = ({ id, label, description }) => {
    const isEnabled = preferences[id] === 'true';
    return (
      <div className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0">
        <div className="pr-8">
          <h4 className="text-sm font-medium text-slate-900">{label}</h4>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <button
          onClick={() => handleToggle(id)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
          role="switch"
          aria-checked={isEnabled}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-slate-500">Loading notification preferences...</div>;
  if (!userId) return <div className="p-8 text-red-500">Could not identify current user. Please re-login.</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Notification Preferences</h2>
        <p className="text-slate-500 mt-1">Decide how and when you want to be notified about system events.</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {message && (
          <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Email Notifications</h3>
          <div className="divide-y divide-slate-100">
            <ToggleSwitch 
              id="EMAIL_NEW_TRANSACTION"
              label="New Transactions" 
              description="Receive an email when a new transaction is logged." 
            />
            <ToggleSwitch 
              id="EMAIL_PRICE_UPDATE"
              label="Price List Updates" 
              description="Get notified when airline price lists are modified." 
            />
            <ToggleSwitch 
              id="EMAIL_SYSTEM_ALERTS"
              label="System Alerts" 
              description="Critical alerts regarding system health and security." 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">In-App Notifications</h3>
          <div className="divide-y divide-slate-100">
            <ToggleSwitch 
              id="INAPP_MENTIONS"
              label="Notes & Mentions" 
              description="Show a notification badge when someone tags you in a note." 
            />
            <ToggleSwitch 
              id="INAPP_TASK_ASSIGNMENT"
              label="Task Assignments" 
              description="Notify me when a new task or action item is assigned to me." 
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
