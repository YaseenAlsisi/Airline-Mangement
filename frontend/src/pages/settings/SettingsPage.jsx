import React, { useState } from 'react';
import { 
  UserCircleIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import MyAccountTab from './components/MyAccountTab';
import UsersTab from './components/UsersTab';
import RolesTab from './components/RolesTab';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('Settings'));
  const [activeTab, setActiveTab] = useState('account');
  const { hasPermission } = useAuthStore();
  
  const tabs = [
    { id: 'account', name: t('My Account'), icon: UserCircleIcon, component: MyAccountTab },
    { id: 'users', name: t('Users'), icon: UsersIcon, component: UsersTab, permission: 'USER_MANAGE' },
    { id: 'roles', name: t('Roles & Permissions'), icon: ShieldCheckIcon, component: RolesTab, permission: 'ROLE_MANAGE' }
  ];

  const visibleTabs = tabs.filter(tab => !tab.permission || hasPermission(tab.permission));
  
  const ActiveComponent = visibleTabs.find(t => t.id === activeTab)?.component || MyAccountTab;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('Settings & Administration')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('Manage your account settings, users, and system preferences.')}</p>
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