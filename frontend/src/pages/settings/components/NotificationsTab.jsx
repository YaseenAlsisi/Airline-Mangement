import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../../api/notifications.api';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ size: 50 });
      setNotifications(res.data?.content || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'SUCCESS': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'ERROR': return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'WARNING': return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      default: return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <div className="p-8 text-slate-500">Loading notifications...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-100 text-red-700 py-0.5 px-2.5 rounded-full text-sm font-medium">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">View your recent system alerts and updates.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <BellIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No notifications yet</h3>
            <p className="text-slate-500 mt-1 max-w-sm">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-slate-50 transition flex items-start gap-4 ${!notification.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
