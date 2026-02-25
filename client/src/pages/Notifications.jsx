import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import moment from 'moment';
import 'moment/locale/vi';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  CheckIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/solid';
import NotificationSidebar from '../components/Notifications/NotificationSidebar';
import { toast } from 'react-hot-toast';

// Set moment locale to Vietnamese
moment.locale('vi');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread'
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newNotification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.off('newNotification');
  }, [socket]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      // Assuming there's an endpoint for marking all as read
      // For now, we'll just update the local state if the endpoint is not ready
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (err) {
      console.error('Mark all read error:', err);
      // Fallback if endpoint fails
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả trên giao diện');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <div className="p-2 bg-blue-600 rounded-full shadow-sm"><HeartIcon className="h-4 w-4 text-white" /></div>;
      case 'comment': return <div className="p-2 bg-green-500 rounded-full shadow-sm"><ChatBubbleLeftIcon className="h-4 w-4 text-white" /></div>;
      case 'friend_request': return <div className="p-2 bg-blue-500 rounded-full shadow-sm"><UserPlusIcon className="h-4 w-4 text-white" /></div>;
      case 'friend_accept': return <div className="p-2 bg-green-600 rounded-full shadow-sm"><CheckIcon className="h-4 w-4 text-white" /></div>;
      default: return null;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
      {/* Sidebar */}
      <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
        <NotificationSidebar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onMarkAllRead={markAllRead}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="mb-6 flex items-center justify-between lg:hidden text-gray-900 dark:text-white">
            <h1 className="text-2xl font-bold">Thông báo</h1>
            <button
              onClick={markAllRead}
              className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
            >
              Đánh dấu tất cả là đã đọc
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
            <div className="divide-y dark:divide-gray-700">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-20 text-center text-gray-500 dark:text-gray-400">
                  <BellIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Bạn chưa có thông báo nào.</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markRead(notification.id)}
                    className={`flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={notification.fromUser?.profilePicture || 'https://via.placeholder.com/40'}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover border dark:border-gray-600"
                      />
                      <div className="absolute -right-1 -bottom-1">
                        {getIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-gray-900 dark:text-gray-100 text-sm md:text-base leading-snug">
                        <span className="font-bold">{notification.fromUser?.firstName} {notification.fromUser?.lastName}</span>
                        {' '}{notification.message}
                      </p>
                      <span className={`text-[13px] ${!notification.isRead ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {moment(notification.createdAt).fromNow()}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-6 w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 self-center"></div>
                    )}
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full self-center">
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple icon for placeholder
const BellIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default Notifications;