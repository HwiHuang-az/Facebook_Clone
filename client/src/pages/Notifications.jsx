import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  CheckIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/solid';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
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

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <div className="p-2 bg-blue-600 rounded-full"><HeartIcon className="h-4 w-4 text-white" /></div>;
      case 'comment': return <div className="p-2 bg-green-500 rounded-full"><ChatBubbleLeftIcon className="h-4 w-4 text-white" /></div>;
      case 'friend_request': return <div className="p-2 bg-blue-500 rounded-full"><UserPlusIcon className="h-4 w-4 text-white" /></div>;
      case 'friend_accept': return <div className="p-2 bg-green-600 rounded-full"><CheckIcon className="h-4 w-4 text-white" /></div>;
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-facebook overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">Thông báo</h1>
          <button className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1 rounded-md text-sm font-semibold">
            Đánh dấu tất cả là đã đọc
          </button>
        </div>

        <div className="divide-y dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Bạn chưa có thông báo nào.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markRead(notification.id)}
                className={`flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={notification.fromUser?.profilePicture || 'https://via.placeholder.com/40'}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="absolute -right-1 -bottom-1">
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-gray-100 text-sm md:text-base">
                    <span className="font-bold">{notification.fromUser?.firstName} {notification.fromUser?.lastName}</span>
                    {' '}{notification.message}
                  </p>
                  <span className="text-xs font-semibold text-blue-600">
                    {moment(notification.createdAt).fromNow()}
                  </span>
                </div>
                {!notification.isRead && (
                  <div className="mt-2 w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                  <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;