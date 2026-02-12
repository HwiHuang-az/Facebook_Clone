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
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const primaryMenuItems = [
    { IconOutline: UserIcon, label: user?.firstName || 'Trang cá nhân', path: '/profile' },
    { IconOutline: UserGroupIcon, label: 'Bạn bè', path: '/friends' },
    { IconOutline: ClockIcon, label: 'Kỷ niệm', path: '/memories' },
    { IconOutline: BookmarkIcon, label: 'Đã lưu', path: '/saved' },
    { IconOutline: RectangleGroupIcon, label: 'Nhóm', path: '/groups' },
    { IconOutline: TvIcon, label: 'Video', path: '/watch' },
    { IconOutline: BuildingStorefrontIcon, label: 'Marketplace', path: '/marketplace' },
  ];

  const secondaryMenuItems = [
    { IconOutline: RssIcon, label: 'Bảng feed', path: '/feed' },
    { IconOutline: CalendarIcon, label: 'Sự kiện', path: '/events' },
    { IconOutline: BuildingLibraryIcon, label: 'Trung tâm quản lý', path: '/management' },
    { IconOutline: HeartIcon, label: 'Góp ý từ bạn bè', path: '/fundraisers' },
  ];

  const visibleSecondary = showMore ? secondaryMenuItems : secondaryMenuItems.slice(0, 0);

  return (
    <nav className="space-y-1 sticky top-20">
      {/* User Profile Card */}
      <Link
        to={`/profile/${user?.id}`}
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <img
          src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1877f2&color=fff`}
          alt={user?.firstName}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-gray-900 font-medium group-hover:text-facebook-600">{user?.firstName} {user?.lastName}</span>
      </Link>

      {/* Primary Menu Items */}
      {primaryMenuItems.map((item, index) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              isActive ? 'bg-gray-100 text-facebook-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.IconOutline className={`h-6 w-6 flex-shrink-0 ${isActive ? 'text-facebook-600' : 'text-gray-600'}`} />
            <span className={`font-medium ${isActive ? 'text-facebook-600' : 'text-gray-700'}`}>{item.label}</span>
          </Link>
        );
      })}

      {/* Secondary Menu Items (Collapsible) */}
      {visibleSecondary.map((item, index) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link
            key={`secondary-${index}`}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              isActive ? 'bg-gray-100 text-facebook-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.IconOutline className={`h-6 w-6 flex-shrink-0 ${isActive ? 'text-facebook-600' : 'text-gray-600'}`} />
            <span className={`font-medium ${isActive ? 'text-facebook-600' : 'text-gray-700'}`}>{item.label}</span>
          </Link>
        );
      })}

      {/* See More Button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
      >
        <EllipsisHorizontalIcon className="h-6 w-6 flex-shrink-0 text-gray-600 group-hover:text-facebook-600" />
        <span className="font-medium group-hover:text-facebook-600">
          {showMore ? 'Ẩn bớt' : 'Xem thêm'}
        </span>
      </button>

      {/* Shortcuts Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 px-3">Lối tắt của bạn</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer group">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex-shrink-0 flex items-center justify-center">
              <RectangleGroupIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium group-hover:text-facebook-600">Nhóm yêu thích</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex-shrink-0 flex items-center justify-center">
              <StarIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium group-hover:text-facebook-600">Trang đã thích</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar; 