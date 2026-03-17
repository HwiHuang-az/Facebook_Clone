import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api from '../../utils/api';
import moment from 'moment';
import 'moment/locale/vi';


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
  PencilSquareIcon,
  PhotoIcon,
  VideoCameraIcon,
  ChevronDownIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  FlagIcon,
  ClockIcon,
  XMarkIcon as XMarkIconOutline
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  TvIcon as TvIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  RectangleGroupIcon as RectangleGroupIconSolid,
  FlagIcon as FlagIconSolid,
} from '@heroicons/react/24/solid';

const Header = () => {
  const { user, logout } = useAuth();
  const { onlineUsers, unreadMessages, unreadNotifications, setUnreadMessages, setUnreadNotifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();


  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showMessengerMenu, setShowMessengerMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const [recentConversations, setRecentConversations] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingMessenger, setLoadingMessenger] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);


  const accountMenuRef = useRef(null);
  const createMenuRef = useRef(null);
  const messengerMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const searchBarRef = useRef(null);

  // Reset counts when visiting pages
  useEffect(() => {
    if (location.pathname === '/messages') setUnreadMessages(0);
    if (location.pathname === '/notifications') setUnreadNotifications(0);
  }, [location.pathname]);

  const fetchRecentConversations = async () => {
    setLoadingMessenger(true);
    try {
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setRecentConversations(res.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Fetch recent conversations error:', err);
    } finally {
      setLoadingMessenger(false);
    }
  };

  const fetchRecentNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setRecentNotifications(res.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Fetch recent notifications error:', err);
    }
  };

  const fetchRecentSearches = async () => {
    setLoadingSearch(true);
    try {
      const res = await api.get('/search/recent');
      if (res.data.success) {
        setRecentSearches(res.data.data);
      }
    } catch (err) {
      console.error('Fetch recent searches error:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const deleteRecentSearch = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.delete(`/search/recent/${id}`);
      if (res.data.success) {
        setRecentSearches(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Delete search error:', err);
    }
  };

  const toggleMessenger = () => {
    if (!showMessengerMenu) fetchRecentConversations();
    setShowMessengerMenu(!showMessengerMenu);
    setShowNotificationMenu(false);
    setShowCreateMenu(false);
    setShowAccountMenu(false);
  };

  const toggleNotifications = () => {
    if (!showNotificationMenu) fetchRecentNotifications();
    setShowNotificationMenu(!showNotificationMenu);
    setShowMessengerMenu(false);
    setShowCreateMenu(false);
    setShowAccountMenu(false);
  };


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
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const navigationItems = [
    {
      path: '/',
      label: 'Trang chủ',
      IconOutline: HomeIcon,
      IconSolid: HomeIconSolid,
      isActive: location.pathname === '/',
    },
    {
      path: '/friends',
      label: 'Bạn bè',
      IconOutline: UserGroupIcon,
      IconSolid: UserGroupIconSolid,
      isActive: location.pathname.startsWith('/friends'),
    },
    {
      path: '/watch',
      label: 'Video',
      IconOutline: TvIcon,
      IconSolid: TvIconSolid,
      isActive: location.pathname.startsWith('/watch'),
    },
    {
      path: '/marketplace',
      label: 'Marketplace',
      IconOutline: BuildingStorefrontIcon,
      IconSolid: BuildingStorefrontIconSolid,
      isActive: location.pathname.startsWith('/marketplace'),
    },
    {
      path: '/groups',
      label: 'Nhóm',
      IconOutline: RectangleGroupIcon,
      IconSolid: RectangleGroupIconSolid,
      isActive: location.pathname.startsWith('/groups'),
    },
    {
      path: '/pages',
      label: 'Trang',
      IconOutline: FlagIcon,
      IconSolid: FlagIconSolid,
      isActive: location.pathname.startsWith('/pages'),
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
            <div className="flex-1 max-w-60 relative" ref={searchBarRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${showSearchDropdown ? 'text-facebook-600' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm trên Facebook"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      setShowSearchDropdown(true);
                      fetchRecentSearches();
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-md transition-all duration-200 text-sm"
                  />
                </div>
              </form>

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-0 -left-2 -right-2 bg-white rounded-b-lg shadow-dropdown border border-gray-200 pt-14 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">Tìm kiếm gần đây</h3>
                    <Link to="/search" className="text-facebook-600 hover:bg-gray-100 px-2 py-1 rounded text-xs transition-colors">Chỉnh sửa</Link>
                  </div>
                  <div className="py-2 max-h-96 overflow-y-auto">
                    {loadingSearch ? (
                      <div className="px-4 py-3 text-center text-gray-500 text-xs italic font-segoe">Đang tải...</div>
                    ) : recentSearches.length === 0 ? (
                      <div className="px-4 py-3 text-center text-gray-500 text-xs italic font-segoe">Không có tìm kiếm nào gần đây</div>
                    ) : (
                      recentSearches.map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between px-2 mx-2 py-2 hover:bg-gray-100 rounded-lg cursor-pointer group transition-colors"
                          onClick={() => {
                            setSearchQuery(search.query);
                            navigate(`/search?q=${encodeURIComponent(search.query)}`);
                            setShowSearchDropdown(false);
                          }}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <ClockIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <span className="text-sm text-gray-700 truncate">{search.query}</span>
                          </div>
                          <button
                            onClick={(e) => deleteRecentSearch(search.id, e)}
                            className="p-1.5 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XMarkIconOutline className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 max-w-2xl">
            <div className="flex space-x-2">
              {navigationItems.map(({ path, IconOutline, IconSolid, label, isActive }) => {
                const Icon = isActive ? IconSolid : IconOutline;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center justify-center h-12 px-8 rounded-lg transition-colors duration-200 relative group ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    title={label}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? 'text-facebook-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-facebook-600 rounded-t-full"></div>
                    )}
                  </Link>
                );
              })}
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
                        <PencilSquareIcon className="h-4 w-4 text-gray-700" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Bài viết</div>
                        <div className="text-sm text-gray-500">Chia sẻ khoảnh khắc với bạn bè</div>
                      </div>
                    </Link>
                    <Link to="/create/story" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <PhotoIcon className="h-4 w-4 text-gray-700" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Tin</div>
                        <div className="text-sm text-gray-500">Chia sẻ ảnh và video</div>
                      </div>
                    </Link>
                    <Link to="/create/room" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <VideoCameraIcon className="h-4 w-4 text-gray-700" />
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
                onClick={toggleMessenger}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200 relative"

                title="Messenger"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-700" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>


              {showMessengerMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-dropdown border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Chat</h3>
                    <Link to="/messages" className="text-facebook-600 hover:underline text-sm">Xem tất cả</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingMessenger ? (
                      <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
                    ) : recentConversations.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">Không có tin nhắn nào</div>
                    ) : (
                      recentConversations.map((conv) => (
                        <div
                          key={conv.user.id}
                          onClick={() => { navigate('/messages'); setShowMessengerMenu(false); }}
                          className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="relative mr-3">
                            <img src={conv.user.profilePicture || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover" />
                            {onlineUsers.has(conv.user.id) && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-gray-900 truncate ${!conv.lastMessage?.isRead && conv.lastMessage?.receiverId === user.id ? 'font-bold' : ''}`}>
                              {conv.user.firstName} {conv.user.lastName}
                            </div>
                            <div className={`text-sm text-gray-500 truncate ${!conv.lastMessage?.isRead && conv.lastMessage?.receiverId === user.id ? 'font-bold text-gray-900' : ''}`}>
                              {conv.lastMessage?.senderId === user.id ? 'Bạn: ' : ''}{conv.lastMessage?.content}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 ml-2">
                            {moment(conv.lastMessage?.createdAt).fromNow(true)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={toggleNotifications}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200 relative"

                title="Thông báo"
              >
                <BellIcon className="h-5 w-5 text-gray-700" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>


              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-dropdown border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    <Link to="/notifications" className="text-facebook-600 hover:underline text-sm">Xem tất cả</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">Không có thông báo nào</div>
                    ) : (
                      recentNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => { navigate('/notifications'); setShowNotificationMenu(false); }}
                          className={`flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer transition ${!notif.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <img src={notif.fromUser?.profilePicture || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full mr-3 object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">{notif.fromUser?.firstName} {notif.fromUser?.lastName}</span> {notif.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{moment(notif.createdAt).fromNow()}</div>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 bg-facebook-600 rounded-full"></div>}
                        </div>
                      ))
                    )}
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
                        <Cog6ToothIcon className="h-4 w-4 text-gray-700" />
                      </div>
                      <span className="text-gray-900">Cài đặt & quyền riêng tư</span>
                    </Link>

                    <Link to="/help" className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-700" />
                      </div>
                      <span className="text-gray-900">Trợ giúp & hỗ trợ</span>
                    </Link>

                    <button className="flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <MoonIcon className="h-4 w-4 text-gray-700" />
                      </div>
                      <span className="text-gray-900">Màn hình & trợ năng</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <ArrowRightOnRectangleIcon className="h-4 w-4 text-gray-700" />
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