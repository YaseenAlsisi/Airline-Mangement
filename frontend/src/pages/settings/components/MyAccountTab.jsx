import React from 'react';

const MyAccountTab = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">My Profile</h2>
      
      <div className="flex items-center space-x-6 mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
          A
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Admin User</h3>
          <p className="text-sm text-slate-500">admin@example.com</p>
          <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-slate-900 border-b pb-2">Personal Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue="Admin User" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue="admin@example.com" />
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm">
              Update Profile
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-medium text-slate-900 border-b pb-2">Change Password</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
            </div>
            <button className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 transition shadow-sm font-medium text-sm">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountTab;
