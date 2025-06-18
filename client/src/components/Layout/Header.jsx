import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  UserGroupIcon,
  TvIcon,
  BuildingStorefrontIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  TvIcon as TvIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  RectangleGroupIcon as RectangleGroupIconSolid,
} from '@heroicons/react/24/solid';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showMessengerMenu, setShowMessengerMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  
  const accountMenuRef = useRef(null);
  const createMenuRef = useRef(null);
  const messengerMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
      if (messengerMenuRef.current && !messengerMenuRef.current.contains(event.target)) {
        setShowMessengerMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    { 
      path: '/', 
      Icon: HomeIcon, 
      IconSolid: HomeIconSolid, 
      label: 'Trang chủ',
      isActive: location.pathname === '/'
    },
    { 
      path: '/friends', 
      Icon: UserGroupIcon, 
      IconSolid: UserGroupIconSolid, 
      label: 'Bạn bè',
      isActive: location.pathname.startsWith('/friends')
    },
    { 
      path: '/watch', 
      Icon: TvIcon, 
      IconSolid: TvIconSolid, 
      label: 'Video',
      isActive: location.pathname.startsWith('/watch')
    },
    { 
      path: '/marketplace', 
      Icon: BuildingStorefrontIcon, 
      IconSolid: BuildingStorefrontIconSolid, 
      label: 'Marketplace',
      isActive: location.pathname.startsWith('/marketplace')
    },
    { 
      path: '/groups', 
      Icon: RectangleGroupIcon, 
      IconSolid: RectangleGroupIconSolid, 
      label: 'Nhóm',
      isActive: location.pathname.startsWith('/groups')
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between h-14 px-4">
          
          {/* Left Section - Logo and Search */}
          <div className="flex items-center space-x-2 flex-1 max-w-xs">
            {/* Facebook Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="w-10 h-10 bg-facebook-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">f</span>
              </div>
            </Link>
            
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex-1 max-w-60">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trên Facebook"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-md transition-all duration-200 text-sm"
                />
              </div>
            </form>
          </div>

          {/* Center Section - Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 max-w-2xl">
            <div className="flex space-x-2">
              {navigationItems.map(({ path, Icon, IconSolid, label, isActive }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center justify-center h-12 px-8 rounded-lg transition-colors duration-200 relative group ${
                    isActive 
                      ? 'text-facebook-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title={label}
                >
                  {isActive ? (
                    <IconSolid className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-facebook-600 rounded-t-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 flex-1 justify-end max-w-xs">
            
            {/* Create Menu */}
            <div className="relative" ref={createMenuRef}>
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200"
                title="Tạo"
              >
                <PlusIcon className="h-5 w-5 text-gray-700" />
              </button>
              
              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-dropdown border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Tạo</h3>
                  </div>
                  <div className="py-2">
                    <Link to="/create/post" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm">📝</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Bài viết</div>
                        <div className="text-sm text-gray-500">Chia sẻ khoảnh khắc với bạn bè</div>
                      </div>
                    </Link>
                    <Link to="/create/story" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm">📖</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Tin</div>
                        <div className="text-sm text-gray-500">Chia sẻ ảnh và video</div>
                      </div>
                    </Link>
                    <Link to="/create/room" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm">📹</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Phòng</div>
                        <div className="text-sm text-gray-500">Gọi video với bạn bè</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Messenger */}
            <div className="relative" ref={messengerMenuRef}>
              <button
                onClick={() => setShowMessengerMenu(!showMessengerMenu)}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200 relative"
                title="Messenger"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              
              {showMessengerMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-dropdown border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Chat</h3>
                    <Link to="/messages" className="text-facebook-600 hover:underline text-sm">Xem tất cả</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {/* Sample messages */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer">
                        <div className="relative mr-3">
                          <img src={`https://picsum.photos/40/40?random=${i}`} alt="" className="w-10 h-10 rounded-full" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">Người dùng {i}</div>
                          <div className="text-sm text-gray-500 truncate">Tin nhắn mới nhất...</div>
                        </div>
                        <div className="text-xs text-gray-400">2 phút</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200 relative"
                title="Thông báo"
              >
                <BellIcon className="h-5 w-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">5</span>
              </button>
              
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-dropdown border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    <Link to="/notifications" className="text-facebook-600 hover:underline text-sm">Xem tất cả</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {/* Sample notifications */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer">
                        <img src={`https://picsum.photos/40/40?random=${i + 10}`} alt="" className="w-10 h-10 rounded-full mr-3" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Người dùng {i}</span> đã thích bài viết của bạn
                          </div>
                          <div className="text-xs text-gray-500 mt-1">5 phút trước</div>
                        </div>
                        <div className="w-2 h-2 bg-facebook-600 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account Menu */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center space-x-1 hover:bg-gray-100 rounded-lg p-1 transition-colors duration-200"
                title="Tài khoản"
              >
                <img 
                  src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1877f2&color=fff`} 
                  alt={user?.firstName}
                  className="w-8 h-8 rounded-full"
                />
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              </button>
              
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-dropdown border border-gray-200 py-2 z-50">
                  {/* Profile Section */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <Link to={`/profile/${user?.id}`} className="flex items-center hover:bg-gray-100 rounded-lg p-2 -m-2">
                      <img 
                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1877f2&color=fff`} 
                        alt={user?.firstName}
                        className="w-9 h-9 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                        <div className="text-sm text-gray-500">Xem trang cá nhân của bạn</div>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <Link to="/settings" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-gray-900">Cài đặt & quyền riêng tư</span>
                    </Link>
                    
                    <Link to="/help" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-gray-900">Trợ giúp & hỗ trợ</span>
                    </Link>
                    
                    <button className="flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <MoonIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-gray-900">Màn hình & trợ năng</span>
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-gray-900">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 