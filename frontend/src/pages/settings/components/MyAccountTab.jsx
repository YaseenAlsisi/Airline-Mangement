import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { updateProfile, changePassword } from '../../../api/auth.api';
import { useTranslation } from 'react-i18next';

const MyAccountTab = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await updateProfile(profileForm);
      setUser(res.data); // Update the global user store with new details
      setProfileMessage({ type: 'success', text: t('Profile updated successfully!') });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || t('Failed to update profile') });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('New passwords do not match') });
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage({ type: 'success', text: t('Password changed successfully!') });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || t('Failed to change password') });
    } finally {
      setPasswordLoading(false);
    }
  };

  const userInitials = user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">{t('My Profile')}</h2>
      
      <div className="flex items-center space-x-6 mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
          {userInitials}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{user?.fullName || t('User')}</h3>
          <p className="text-sm text-slate-500">{user?.email || t('No email')}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium ${user?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {user?.active ? t('Active') : t('Inactive')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <h4 className="text-lg font-medium text-slate-900 border-b pb-2">{t('Personal Information')}</h4>
          
          {profileMessage.text && (
            <div className={`p-3 rounded-md text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {profileMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('Full Name')}</label>
              <input 
                type="text" 
                name="fullName"
                value={profileForm.fullName}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('Email Address')}</label>
              <input 
                type="email" 
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <button 
              type="submit" 
              disabled={profileLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm disabled:opacity-50"
            >
              {profileLoading ? t('Updating...') : t('Update Profile')}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <h4 className="text-lg font-medium text-slate-900 border-b pb-2">{t('Change Password')}</h4>
          
          {passwordMessage.text && (
            <div className={`p-3 rounded-md text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {passwordMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('Current Password')}</label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('New Password')}</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('Confirm New Password')}</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <button 
              type="submit" 
              disabled={passwordLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm disabled:opacity-50"
            >
              {passwordLoading ? t('Changing Password...') : t('Change Password')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyAccountTab;
