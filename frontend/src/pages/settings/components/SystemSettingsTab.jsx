import React from 'react';

const SystemSettingsTab = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">System Settings</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm">
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Company Name</label>
            <input type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue="LDI Airline Management" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Default Currency</label>
            <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option>EGP</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Default Timezone</label>
            <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option>Africa/Cairo (UTC+2)</option>
              <option>UTC</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Date Format</label>
            <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Number Format</label>
            <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option>1,234,567.89</option>
              <option>1.234.567,89</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Pagination Default Limit</label>
            <input type="number" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue="20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsTab;
