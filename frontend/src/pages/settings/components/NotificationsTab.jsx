import React from 'react';

const NotificationsTab = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Notification Preferences</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm">
          Update Preferences
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Real-Time Chat & Notes</h3>
            <p className="text-sm text-slate-500">Receive notifications when someone replies to your notes or sends a message.</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-slate-700">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
              <span>In-App</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-slate-700">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span>Email</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Import Status</h3>
            <p className="text-sm text-slate-500">Get notified when a background import completes or fails.</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-slate-700">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
              <span>In-App</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-slate-700">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
              <span>Email</span>
            </label>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Financial Alerts</h3>
            <p className="text-sm text-slate-500">Important notifications regarding transactions and price list updates.</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-slate-700">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
              <span>In-App</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-slate-700">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
              <span>Email</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Sound Notifications</h3>
            <p className="text-sm text-slate-500">Play a sound for real-time chat messages.</p>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
