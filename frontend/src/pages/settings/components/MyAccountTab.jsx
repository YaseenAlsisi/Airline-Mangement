import React, { useState, useEffect } from 'react';
import { myAccountApi } from '../../../api/usersApi';

const MyAccountTab = () => {
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
      setError('Failed to load profile.');
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
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const changePassword = async () => {
    setMessage('');
    setError('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      await myAccountApi.changePassword({ 
        oldPassword: passwords.oldPassword, 
        newPassword: passwords.newPassword 
      });
      setMessage('Password updated successfully.');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password. Make sure your old password is correct.');
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading profile...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">My Account</h2>
      
      {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Profile Form */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={profile.fullName} 
                onChange={handleProfileChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
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
              Update Profile
            </button>
          </div>
        </div>

        {/* Password Form */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <input 
                type="password" 
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
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
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountTab;
