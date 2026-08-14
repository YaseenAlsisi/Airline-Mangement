import React, { useState } from 'react';
import { 
  UserCircleIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  LockClosedIcon, 
  Cog6ToothIcon, 
  BellAlertIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import MyAccountTab from './components/MyAccountTab';
import UsersTab from './components/UsersTab';
import RolesTab from './components/RolesTab';
import SecurityTab from './components/SecurityTab';
import SystemSettingsTab from './components/SystemSettingsTab';
import NotificationsTab from './components/NotificationsTab';

const tabs = [
  { id: 'account', name: 'My Account', icon: UserCircleIcon, component: MyAccountTab },
  { id: 'users', name: 'Users', icon: UsersIcon, component: UsersTab, permission: 'USER_MANAGE' },
  { id: 'roles', name: 'Roles & Permissions', icon: ShieldCheckIcon, component: RolesTab, permission: 'ROLE_MANAGE' },
  { id: 'security', name: 'Security', icon: LockClosedIcon, component: SecurityTab, permission: 'SETTINGS_MANAGE' },
  { id: 'system', name: 'System', icon: Cog6ToothIcon, component: SystemSettingsTab, permission: 'SYSTEM_VIEW' },
  { id: 'notifications', name: 'Notifications', icon: BellAlertIcon, component: NotificationsTab },
  { id: 'audit', name: 'Audit & Activity', icon: DocumentMagnifyingGlassIcon, component: () => <div className="p-6 text-slate-500">Audit logs coming soon...</div>, permission: 'AUDIT_VIEW' },
];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');

  // TODO: Replace with actual auth context to filter tabs by permission
  const userPermissions = ['USER_MANAGE', 'ROLE_MANAGE', 'SETTINGS_MANAGE', 'SYSTEM_VIEW', 'AUDIT_VIEW']; 
  
  const visibleTabs = tabs.filter(tab => !tab.permission || userPermissions.includes(tab.permission));
  
  const ActiveComponent = visibleTabs.find(t => t.id === activeTab)?.component || MyAccountTab;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings & Administration</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your account settings, users, and system preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-1/4">
          <nav className="space-y-1" aria-label="Settings navigation">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <tab.icon 
                    className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 transition-colors duration-200 
                      ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} 
                    aria-hidden="true" 
                  />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:w-3/4 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
};