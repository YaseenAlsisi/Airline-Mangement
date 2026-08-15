import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, requiredPermission: null },
  { name: 'Excel Import', href: '/import', icon: ArrowUpTrayIcon, requiredPermission: 'IMPORT_VIEW' },
  { name: 'Price Lists', href: '/price-lists', icon: CurrencyDollarIcon, requiredPermission: 'PRICE_VIEW' },
  { name: 'Agent Data', href: '/agents', icon: UsersIcon, requiredPermission: 'AGENT_VIEW' },
  { name: 'Airlines', href: '/airlines', icon: PaperAirplaneIcon, requiredPermission: 'AIRLINE_VIEW' },
  { name: 'Transactions', href: '/transactions', icon: CreditCardIcon, requiredPermission: 'TRANSACTION_VIEW' },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, requiredPermission: 'REPORT_VIEW' },
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
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-white font-bold text-xl">AAMS</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      clsx(
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                        'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                      )
                    }
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {t(`navigation.${item.name}`)}
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