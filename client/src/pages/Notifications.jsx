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
import { BellIcon as BellIconOutline } from '@heroicons/react/24/outline';
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
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
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

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200">
            <div className="divide-y dark:divide-gray-700">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-20 text-center text-gray-500 dark:text-gray-400 font-segoe">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellIconOutline className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-xl font-bold">Bạn chưa có thông báo nào.</p>
                  <p className="text-sm mt-2 opacity-70">Chúng tôi sẽ thông báo cho bạn khi có tin mới!</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markRead(notification.id)}
                    className={`flex items-start space-x-4 p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-all relative group ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={notification.fromUser?.profilePicture || `https://ui-avatars.com/api/?name=${notification.fromUser?.firstName}+${notification.fromUser?.lastName}`}
                        alt=""
                        className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm transition-transform group-hover:scale-105"
                      />
                      <div className="absolute right-0 bottom-0 transform translate-x-1 translate-y-1">
                        {getIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-gray-900 dark:text-gray-100 text-sm md:text-[15px] leading-relaxed">
                        <span className="font-bold hover:underline">{notification.fromUser?.firstName} {notification.fromUser?.lastName}</span>
                        {' '}<span className="font-medium text-gray-800 dark:text-gray-200">{notification.message}</span>
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[12px] font-bold ${!notification.isRead ? 'text-facebook-600 dark:text-facebook-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {moment(notification.createdAt).fromNow()}
                        </span>
                        {!notification.isRead && <span className="w-1.5 h-1.5 bg-facebook-600 rounded-full"></span>}
                      </div>
                    </div>
                    {/* Unread indicator dot */}
                    {!notification.isRead && (
                      <div className="w-3 h-3 bg-facebook-600 rounded-full flex-shrink-0 self-center shadow-lg shadow-blue-500/50"></div>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2">
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                            <EllipsisHorizontalIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
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

export default Notifications;