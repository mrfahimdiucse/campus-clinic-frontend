import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [logout]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleItemClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications((current) =>
          current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <div className="dropdown dropdown-end z-[100]">
      <label tabIndex={0} className="btn btn-ghost btn-circle relative cursor-pointer">
        <div className="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="badge badge-sm badge-error indicator-item text-white font-bold text-[10px]">
              {unreadCount}
            </span>
          )}
        </div>
      </label>

      {/* Dropdown Box */}
      <div
        tabIndex={0}
        className="dropdown-content mt-3 shadow-2xl bg-white dark:bg-slate-800 rounded-2xl w-[calc(100vw-1.5rem)] max-w-96 text-slate-800 dark:text-slate-100 z-[100] border border-gray-100 dark:border-slate-700 overflow-hidden"
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
          <span className="font-bold text-sm text-gray-800 dark:text-slate-100">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Scrollable Items (Y-Axis Only) */}
        <div className="max-h-[min(420px,calc(100vh-8rem))] overflow-y-auto overflow-x-hidden divide-y divide-gray-100 dark:divide-slate-700 [scrollbar-width:thin] [scrollbar-color:#5000ff_#1e293b]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400 dark:text-slate-400">No notifications yet</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleItemClick(n)}
                className={`p-3.5 transition-colors cursor-pointer hover:bg-gray-50 flex flex-col gap-1 ${
                  !n.isRead ? 'bg-purple-50/60 dark:bg-purple-950/40 font-medium' : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <p className="text-xs leading-relaxed break-words">{n.message}</p>
                <span className="text-[10px] text-gray-400">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;