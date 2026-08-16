import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead } from '../../api/notifications.api';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  ChevronDownIcon,
  LanguageIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Squares2X2Icon } from '@heroicons/react/24/solid';

export const Header = ({ onMenuClick }) => {
  const { user, logout, refreshToken } = useAuthStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Notifications state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.data?.count || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications({ size: 10 });
      setNotifications(res.data?.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async () => {
    if (!isNotificationsOpen) {
      await fetchNotifications();
    }
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      fetchUnreadCount();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

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

  return (
    <header className="flex h-24 shrink-0 items-center justify-between bg-transparent px-4 sm:px-6 lg:px-8 border-b border-slate-100/50">
      
      {/* Mobile Menu Toggle (replaces search on mobile) */}
      <div className="flex lg:hidden items-center">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors"
        >
          <Squares2X2Icon className="w-8 h-8" />
        </button>
      </div>

      {/* Search Bar - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 max-w-lg">
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

        {/* Notifications */}
        <div className="flex items-center gap-3 border-r border-slate-200 pr-6 mr-2 relative" ref={notifRef}>
          <button 
            onClick={handleNotificationClick}
            className="text-slate-400 hover:text-slate-600 transition-colors relative focus:outline-none"
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-10 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-800">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                        {!notif.isRead && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 text-center bg-slate-50 rounded-b-xl hover:bg-slate-100 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-indigo-600">View all notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-x-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-full transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-inner">
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

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                {t('header.logout', 'Log out')}
              </button>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};