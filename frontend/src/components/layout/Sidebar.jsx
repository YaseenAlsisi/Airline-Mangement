import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, requiredPermission: null },
  { name: 'Excel Import', href: '/import', icon: ArrowUpTrayIcon, requiredPermission: 'IMPORT_VIEW' },
  { name: 'Price Lists', href: '/price-lists', icon: CurrencyDollarIcon, requiredPermission: 'PRICE_VIEW' },
  { name: 'Agent Data', href: '/agents', icon: UsersIcon, requiredPermission: 'AGENT_VIEW' },
  { name: 'Airlines', href: '/airlines', icon: PaperAirplaneIcon, requiredPermission: 'AIRLINE_VIEW' },
  { name: 'Transactions', href: '/transactions', icon: CreditCardIcon, requiredPermission: 'TRANSACTION_VIEW' },
  { name: 'Reports', href: '/sales-reports', icon: ChartBarIcon, requiredPermission: 'REPORT_VIEW' },
  { name: 'Notes', href: '/notes', icon: ChatBubbleLeftRightIcon, requiredPermission: 'NOTE_VIEW' },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, requiredPermission: 'SYSTEM_VIEW' }
];

export const Sidebar = () => {
  const { t } = useTranslation();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  
  const filteredNavigation = navigation.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <div className="flex grow flex-col overflow-hidden bg-[#0B1121] relative h-full w-full">
      {/* Watermark Background - Exact Airplane over clouds */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url("/airplane-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 85%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 85%)'
        }}
      />
      
      {/* Content wrapper with z-index to stay above watermark, NO scrollbar (fixed) */}
      <div className="relative z-10 flex flex-col h-full px-4 pb-4 overflow-hidden">
        {/* Logo Section */}
        <div className="flex h-24 shrink-0 items-center px-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#fdfbf6] p-2 rounded-xl shadow-sm">
              <RectangleGroupIcon className="w-6 h-6 text-[#0B1121]" strokeWidth={2} />
            </div>
            <h1 className="text-white font-bold text-xl tracking-wide">AAMS</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-1 flex-col mt-2">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="space-y-2">
                {filteredNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        clsx(
                          isActive
                            ? 'bg-[#1e2e4f] text-white shadow-sm ring-1 ring-white/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5',
                          'group flex gap-x-3 rounded-2xl p-3 text-sm font-medium leading-6 transition-all duration-200'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {t(`navigation.${item.name}`)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Bottom Cards */}
        <div className="mt-auto pt-8">
          <div className="bg-[#1e2e4f]/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md mb-4 shadow-lg">
            <PaperAirplaneIcon className="w-6 h-6 text-white/80 transform -rotate-45 shrink-0" strokeWidth={2} />
            <div className="text-[11px] font-medium text-white/90 leading-tight">
              Airline Accounting<br/>Management System
            </div>
          </div>
          <div className="text-xs text-white/40 font-medium px-2">
            © 2025 AAMS
          </div>
        </div>
      </div>
    </div>
  );
};