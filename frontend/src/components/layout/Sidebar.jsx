import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  FolderIcon,
  Squares2X2Icon,
  PaperAirplaneIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, permission: 'REPORT_VIEW' },
  { name: 'Excel Import', href: '/import', icon: ArrowUpTrayIcon, permission: 'IMPORT_CREATE' },
  { name: 'Files History', href: '/files', icon: FolderIcon, permission: 'IMPORT_VIEW' },
  { name: 'Price Lists', href: '/price-lists', icon: CurrencyDollarIcon, permission: 'PRICE_VIEW' },
  { name: 'Agent Data', href: '/agents', icon: UsersIcon, permission: 'AGENT_VIEW' },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, permission: 'REPORT_VIEW' },
  { name: 'Notes', href: '/notes', icon: ChatBubbleLeftRightIcon, permission: 'NOTE_VIEW' },
  { name: 'Safe Calculator', href: '/safe-calculator', icon: CalculatorIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, permission: 'USER_MANAGE' }
];

export const Sidebar = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuthStore();
  const visibleNavigation = navigation.filter(item => !item.permission || hasPermission(item.permission));

  return (
    <div className="relative flex grow flex-col overflow-y-auto overflow-x-hidden bg-[#0f172a] border-r border-gray-800/50">
      
      {/* Realistic Starry/Cloud/Airplane Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/sidebar-bg.png)' }}
      ></div>

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0f172a]/95 via-[#0f172a]/60 to-[#0f172a]/95"></div>

      <div className="relative z-10 flex flex-col h-full px-6">
        <div className="flex h-24 shrink-0 items-center">
          {/* Logo matching the dark theme */}
          <div className="flex items-center gap-3">
            <div className="bg-[#f0f4f8] rounded-xl p-2 shadow-lg">
              <Squares2X2Icon className="w-6 h-6 text-[#0f172a]" strokeWidth={2.5} />
            </div>
            <h1 className="text-white font-bold text-2xl tracking-tight">AAMS</h1>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col pb-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {visibleNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        clsx(
                          isActive
                            ? 'bg-[#1c2438] text-white shadow-md border border-white/5'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white',
                          'group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all'
                        )
                      }
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {t(`navigation.${item.name}`, item.name)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Bottom branding card */}
        <div className="mt-auto pb-6 pt-4">
          <div className="flex items-center gap-3 bg-[#1c2438]/80 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-lg">
            <PaperAirplaneIcon className="w-6 h-6 text-indigo-300 -rotate-45 shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-gray-300 leading-tight">
              Airline Accounting<br/>Management System
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};