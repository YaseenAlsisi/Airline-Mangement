import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export const Header = () => {
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      if (refreshToken) await logoutApi(refreshToken);
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const starStyle = {
    backgroundImage: `
      radial-gradient(1px 1px at 15% 30%, rgba(255,255,255,0.9), transparent),
      radial-gradient(1.5px 1.5px at 45% 75%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,1), transparent),
      radial-gradient(2px 2px at 85% 65%, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 25% 85%, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.8), transparent)
    `,
    backgroundSize: '100px 100px'
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 bg-transparent px-4 sm:gap-x-6 sm:px-6 lg:px-8 justify-end">
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        
        {/* Creative Glassy Language Button (Space Theme) */}
        <button
          onClick={toggleLanguage}
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#152038] via-[#1e2e4f] to-[#273b66] h-10 px-5 text-sm font-extrabold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] shadow-lg shadow-[#0B1121]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#1e2e4f]/60 active:scale-95 border border-[#273b66]/50 backdrop-blur-md"
        >
          {/* Starry background layer */}
          <div 
            className="absolute inset-0 z-0 opacity-70 mix-blend-screen group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
            style={starStyle} 
          />
          
          <GlobeAltIcon className="relative z-10 h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-180" />
          <span className="relative z-10 tracking-wider">
            {i18n.language === 'ar' ? 'EN' : 'عربي'}
          </span>
        </button>
        
        {/* Space Liquid Glassy Logout Button (Sidebar Lightest Color Theme) */}
        <button
          onClick={handleLogout}
          className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#152038] via-[#1e2e4f] to-[#273b66] h-10 pl-5 pr-1.5 text-sm font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] shadow-lg shadow-[#0B1121]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#1e2e4f]/60 active:scale-95 border border-[#273b66]/50 backdrop-blur-md"
        >
          {/* Starry background layer */}
          <div 
            className="absolute inset-0 z-0 opacity-70 mix-blend-screen group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
            style={starStyle} 
          />
          
          <span className="relative z-10 tracking-wide">{t('header.Sign out')}</span>
          
          <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRightIcon className="h-4 w-4 text-[#1e2e4f] rtl:-scale-x-100" />
          </div>
        </button>
      </div>
    </header>
  );
};