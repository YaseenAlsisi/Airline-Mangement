import React from 'react';

const RolesTab = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Roles & Permissions</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm">
          + Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List */}
        <div className="lg:col-span-1 border-r border-slate-200 pr-6">
          <ul className="space-y-3">
            <li className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 cursor-pointer shadow-sm">
              <h3 className="font-semibold text-indigo-900">ADMIN</h3>
              <p className="text-xs text-indigo-700 mt-1">System Administrator (System)</p>
            </li>
            <li className="p-4 hover:bg-slate-50 rounded-xl border border-transparent cursor-pointer transition">
              <h3 className="font-semibold text-slate-700">VIEWER</h3>
              <p className="text-xs text-slate-500 mt-1">Read Only Viewer (System)</p>
            </li>
          </ul>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-900">Permissions for ADMIN</h3>
            <span className="text-xs text-slate-500">System roles cannot be modified</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-sm mb-3">User Management</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-slate-600">
                  <input type="checkbox" checked readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span>USER_MANAGE</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-600">
                  <input type="checkbox" checked readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span>ROLE_MANAGE</span>
                </label>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-sm mb-3">Settings</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-slate-600">
                  <input type="checkbox" checked readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span>SETTINGS_MANAGE</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-600">
                  <input type="checkbox" checked readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span>SYSTEM_VIEW</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesTab;
