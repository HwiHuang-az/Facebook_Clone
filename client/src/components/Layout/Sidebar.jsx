import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  UserIcon,
  UserGroupIcon,
  ClockIcon,
  BookmarkIcon,
  RectangleGroupIcon,
  TvIcon,
  BuildingStorefrontIcon,
  RssIcon,
  CalendarIcon,
  EllipsisHorizontalIcon,
  BuildingLibraryIcon,
  HeartIcon,
  StarIcon,
  FlagIcon,
  VideoCameraIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const primaryMenuItems = [
    { IconOutline: UserIcon, label: user?.firstName || 'Trang cá nhân', path: '/profile' },
    { IconOutline: UserGroupIcon, label: 'Bạn bè', path: '/friends' },
    { IconOutline: BookmarkIcon, label: 'Đã lưu', path: '/saved' },
    { IconOutline: RectangleGroupIcon, label: 'Nhóm', path: '/groups' },
    { IconOutline: FlagIcon, label: 'Trang', path: '/pages' },
    { IconOutline: TvIcon, label: 'Video', path: '/watch' },
    { IconOutline: BuildingStorefrontIcon, label: 'Marketplace', path: '/marketplace' },
  ];

  const secondaryMenuItems = [
    { IconOutline: RssIcon, label: 'Bảng feed', path: '/' },
    { IconOutline: CalendarIcon, label: 'Sự kiện', path: '/events' },
  ];

  const visibleSecondary = showMore ? secondaryMenuItems : secondaryMenuItems.slice(0, 0);

  return (
    <nav className="space-y-1 sticky top-20 font-segoe">
      {/* User Profile Card */}
      <Link
        to={`/profile/${user?.id}`}
        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
      >
        <img
          src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1877f2&color=fff`}
          alt={user?.firstName}
          className="w-9 h-9 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-transform group-hover:scale-105"
        />
        <span className="text-gray-900 dark:text-gray-100 font-bold group-hover:text-facebook-600 dark:group-hover:text-facebook-400 transition-colors">{user?.firstName} {user?.lastName}</span>
      </Link>

      {/* Primary Menu Items */}
      {primaryMenuItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all group ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
          >
            <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${isActive ? 'text-facebook-600 dark:text-facebook-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <item.IconOutline className="h-7 w-7 flex-shrink-0" />
            </div>
            <span className={`font-bold text-[15px] ${isActive ? 'text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-200'}`}>{item.label}</span>
          </Link>
        );
      })}

      {/* Secondary Menu Items (Collapsible) */}
      {visibleSecondary.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={`secondary-${index}`}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all group ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
          >
            <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${isActive ? 'text-facebook-600 dark:text-facebook-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <item.IconOutline className="h-7 w-7 flex-shrink-0" />
            </div>
            <span className={`font-bold text-[15px] ${isActive ? 'text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-200'}`}>{item.label}</span>
          </Link>
        );
      })}

      {/* See More Button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
      >
        <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full transition-transform group-hover:scale-110">
            <EllipsisHorizontalIcon className="h-6 w-6 flex-shrink-0 text-gray-600 dark:text-gray-400 group-hover:text-facebook-600 dark:group-hover:text-facebook-400" />
        </div>
        <span className="font-bold text-[15px] group-hover:text-facebook-600 dark:group-hover:text-facebook-400 transition-colors">
          {showMore ? 'Ẩn bớt' : 'Xem thêm'}
        </span>
      </button>

      {/* Shortcuts Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-[15px] font-bold text-gray-500 dark:text-gray-400 mb-4 px-3">Lối tắt của bạn</h3>
        <div className="space-y-1">
          <Link to="/groups" state={{ activeTab: 'yours' }} className="flex items-center space-x-3 p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer group w-full transition-all">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <RectangleGroupIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[14px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-facebook-600 dark:group-hover:text-facebook-400">Nhóm của bạn</span>
          </Link>
          <Link to="/pages" state={{ activeTab: 'likes' }} className="flex items-center space-x-3 p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer group w-full transition-all">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <StarIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[14px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-facebook-600 dark:group-hover:text-facebook-400">Trang đã thích</span>
          </Link>
          <Link to="/marketplace" state={{ category: '' }} className="flex items-center space-x-3 p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer group w-full transition-all">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <BuildingStorefrontIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[14px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-facebook-600 dark:group-hover:text-facebook-400">Marketplace</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar; 