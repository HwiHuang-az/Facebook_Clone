import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: '👤', label: user?.name || 'Trang cá nhân', path: '/profile', color: 'text-blue-600' },
    { icon: '👥', label: 'Bạn bè', path: '/friends', color: 'text-green-600' },
    { icon: '💬', label: 'Tin nhắn', path: '/messages', color: 'text-purple-600' },
    { icon: '🔔', label: 'Thông báo', path: '/notifications', color: 'text-red-600' },
    { icon: '⚙️', label: 'Cài đặt', path: '/settings', color: 'text-gray-600' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-facebook p-4">
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname.startsWith(item.path)
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className={`text-xl ${item.color}`}>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Lối tắt</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg"></div>
            <span className="text-sm text-gray-700">Nhóm yêu thích</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg"></div>
            <span className="text-sm text-gray-700">Trang đã thích</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 