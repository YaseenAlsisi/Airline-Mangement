import React from 'react';

const SecurityTab = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Security Administration</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm">
          Save Policies
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Password Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Minimum Password Length</label>
              <input type="number" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue="8" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password Expiration (Days)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue="90" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Session Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Session Timeout (Minutes)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue="15" />
            </div>
            <div>
              <label className="flex items-center space-x-2 mt-7">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
                <span className="text-sm font-medium text-slate-700">Allow Multiple Concurrent Sessions</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
