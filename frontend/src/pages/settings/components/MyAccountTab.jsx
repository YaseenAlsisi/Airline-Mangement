import React, { useState, useEffect } from 'react';
import { myAccountApi } from '../../../api/usersApi';
import { useTranslation } from 'react-i18next';

const MyAccountTab = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await myAccountApi.getProfile();
      setProfile({
        fullName: response.fullName || response.data?.fullName || '',
        email: response.email || response.data?.email || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setError(t('settings.account.profileLoadFailed', 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setMessage('');
    setError('');
    try {
      await myAccountApi.updateProfile({ fullName: profile.fullName, email: profile.email });
      setMessage(t('settings.account.profileUpdated', 'Profile updated successfully.'));
    } catch (err) {
      setError(t('settings.account.profileUpdateFailed', 'Failed to update profile.'));
    }
  };

  const changePassword = async () => {
    setMessage('');
    setError('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError(t('settings.account.passwordsNotMatch', 'New passwords do not match.'));
      return;
    }
    try {
      await myAccountApi.changePassword({ 
        oldPassword: passwords.oldPassword, 
        newPassword: passwords.newPassword 
      });
      setMessage(t('settings.account.passwordUpdated', 'Password updated successfully.'));
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(t('settings.account.passwordUpdateFailed', 'Failed to change password. Make sure your old password is correct.'));
    }
  };

  if (loading) return <div className="p-8 text-slate-500">{t('settings.account.loading', 'Loading profile...')}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">{t('settings.account.title', 'My Account')}</h2>
      
      {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Profile Form */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">{t('settings.account.profileInfo', 'Profile Information')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('settings.account.fullName', 'Full Name')}</label>
              <input 
                type="text" 
                name="fullName"
                value={profile.fullName} 
                onChange={handleProfileChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('settings.account.email', 'Email Address')}</label>
              <input 
                type="email" 
                name="email"
                value={profile.email} 
                onChange={handleProfileChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <button 
              onClick={saveProfile}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
            >
              {t('settings.account.updateProfile', 'Update Profile')}
            </button>
          </div>
        </div>

        {/* Password Form */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">{t('settings.account.changePasswordTitle', 'Change Password')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('settings.account.currentPassword', 'Current Password')}</label>
              <input 
                type="password" 
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('settings.account.newPassword', 'New Password')}</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('settings.account.confirmPassword', 'Confirm New Password')}</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <button 
              onClick={changePassword}
              className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 transition shadow-sm font-medium text-sm"
            >
              {t('settings.account.updatePasswordBtn', 'Update Password')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountTab;
