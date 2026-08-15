import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  EnvelopeIcon, 
  ChevronDownIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

export const Header = () => {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="flex h-24 shrink-0 items-center justify-between bg-transparent px-4 sm:px-6 lg:px-8 border-b border-slate-100/50">
      
      {/* Search Bar */}
      <div className="flex flex-1 max-w-lg">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border-0 py-2.5 pl-11 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 bg-white transition-all"
            placeholder={t('header.search', 'Search...')}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-x-4 lg:gap-x-6 ml-4">
        
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
        >
          <LanguageIcon className="h-6 w-6" />
        </button>

        {/* Icons */}
        <div className="flex items-center gap-3 border-r border-slate-200 pr-6 mr-2">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <EnvelopeIcon className="h-6 w-6" />
          </button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-x-3 cursor-pointer hover:bg-white/50 p-1.5 rounded-full transition-colors">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:flex lg:flex-col lg:items-start">
            <span className="text-sm font-semibold leading-5 text-slate-900" aria-hidden="true">
              {user?.fullName || 'Jane Cooper'}
            </span>
            <span className="text-xs leading-4 text-slate-500" aria-hidden="true">
              {user?.roles?.map(r => r.name).join(', ') || 'user@example.com'}
            </span>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-slate-400 ml-1" aria-hidden="true" />
        </div>
        
      </div>
    </header>
  );
};