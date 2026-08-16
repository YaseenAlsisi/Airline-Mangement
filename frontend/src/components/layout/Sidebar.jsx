import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Excel Import', href: '/import', icon: ArrowUpTrayIcon },
  { name: 'Files History', href: '/files', icon: FolderIcon },
  { name: 'Price Lists', href: '/price-lists', icon: CurrencyDollarIcon },
  { name: 'Agent Data', href: '/agents', icon: UsersIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Notes', href: '/notes', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
];

export const Sidebar = () => {
  const { t } = useTranslation();

  return (
    <div className="flex grow flex-col gap-y-8 overflow-y-auto bg-white px-6 pb-4">
      <div className="flex h-24 shrink-0 items-center">
        {/* Logo matching the Puzzler aesthetic */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-4 h-6 bg-blue-500 rounded-sm transform skew-x-[-20deg]"></div>
            <div className="w-4 h-6 bg-orange-400 rounded-sm transform skew-x-[-20deg]"></div>
          </div>
          <h1 className="text-slate-900 font-bold text-2xl tracking-tight">AAMS</h1>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      clsx(
                        isActive
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
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
    </div>
  );
};