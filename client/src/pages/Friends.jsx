import React, { useState, useEffect } from 'react';
import FriendSidebar from '../components/Friends/FriendSidebar';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useFriendships } from '../hooks/useFriendships';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state]);

  const {
    loading,
    friends,
    requests,
    suggestions,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    getFriendRequests,
    getFriends,
    getFriendSuggestions,
    removeSuggestion
  } = useFriendships();

  // Load data when component mounts or tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'suggestions':
        getFriendSuggestions(12);
        break;
      case 'requests':
        getFriendRequests();
        break;
      case 'all':
        getFriends(1, 20, searchTerm);
        break;
      default:
        break;
    }
  }, [activeTab, searchTerm, getFriendSuggestions, getFriendRequests, getFriends]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle send friend request
  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      removeSuggestion(userId);
      showNotification('Gửi lời mời kết bạn thành công!');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Lỗi khi gửi lời mời kết bạn', 'error');
    }
  };

  // Handle accept request
  const handleAcceptRequest = async (friendshipId) => {
    try {
      await acceptFriendRequest(friendshipId);
      showNotification('Chấp nhận lời mời kết bạn thành công!');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Lỗi khi chấp nhận lời mời kết bạn', 'error');
    }
  };

  // Handle reject request
  const handleRejectRequest = async (friendshipId) => {
    try {
      await rejectFriendRequest(friendshipId);
      showNotification('Từ chối lời mời kết bạn thành công!');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Lỗi khi từ chối lời mời kết bạn', 'error');
    }
  };

  // Handle unfriend
  const handleUnfriend = async (friendId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy kết bạn?')) {
      try {
        await unfriend(friendId);
        showNotification('Hủy kết bạn thành công!');
      } catch (error) {
        showNotification(error.response?.data?.message || 'Lỗi khi hủy kết bạn', 'error');
      }
    }
  };

  const counts = {
    suggestions: suggestions.length,
    requests: requests.length,
    friends: friends.length,
    birthdays: 0
  };

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-[999] p-4 px-6 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right duration-300 font-bold ${notification.type === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-green-500 text-white'
          }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{notification.type === 'error' ? 'Oops!' : 'Thành công!'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
        <FriendSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-facebook-600"></div>
            </div>
          )}

          {/* Friend Suggestions */}
          {activeTab === 'suggestions' && (
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-6">Những người bạn có thể biết</h2>
              {suggestions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook py-24 text-center border border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-5xl">👋</span>
                    </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-bold">Không có gợi ý kết bạn nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group active:scale-[0.98]">
                      <Link to={`/profile/${suggestion.id}`} className="block h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                        {suggestion.profilePicture ? (
                          <img src={suggestion.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-400 text-5xl font-extrabold uppercase tracking-widest">
                            {suggestion.firstName.charAt(0)}{suggestion.lastName.charAt(0)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Link>
                      <div className="p-5">
                        <Link to={`/profile/${suggestion.id}`} className="font-extrabold text-gray-900 dark:text-white hover:text-facebook-600 dark:hover:text-facebook-400 transition-colors text-lg block mb-4 truncate">
                          {suggestion.firstName} {suggestion.lastName}
                        </Link>
                        <div className="space-y-2.5">
                          <button
                            onClick={() => handleSendRequest(suggestion.id)}
                            className="w-full bg-facebook-600 text-white py-2.5 rounded-xl font-bold hover:bg-facebook-700 transition-all shadow-md active:scale-95"
                          >
                            Thêm bạn bè
                          </button>
                          <button
                            onClick={() => removeSuggestion(suggestion.id)}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friend Requests */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-6">Lời mời kết bạn</h2>
              {requests.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-20 text-center">
                  <p className="text-gray-500">Không có lời mời kết bạn nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {requests.map((request) => (
                    <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group active:scale-[0.98]">
                      <Link to={`/profile/${request.user1?.id}`} className="block h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                        {request.user1?.profilePicture ? (
                          <img src={request.user1?.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-400 text-5xl font-extrabold uppercase tracking-widest">
                            {request.user1?.firstName.charAt(0)}{request.user1?.lastName.charAt(0)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Link>
                      <div className="p-5">
                        <Link to={`/profile/${request.user1?.id}`} className="font-extrabold text-gray-900 dark:text-white hover:text-facebook-600 dark:hover:text-facebook-400 transition-colors text-lg block mb-1 truncate">
                          {request.user1?.firstName} {request.user1?.lastName}
                        </Link>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</p>
                        <div className="space-y-2.5">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="w-full bg-facebook-600 text-white py-2.5 rounded-xl font-bold hover:bg-facebook-700 transition-all shadow-md active:scale-95"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Friends */}
          {activeTab === 'all' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Tất cả bạn bè ({friends.length})</h2>
                <div className="relative w-72">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bạn bè"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-xl text-[15px] font-medium focus:ring-2 focus:ring-facebook-600/50 outline-none shadow-facebook dark:text-white transition-all"
                  />
                </div>
              </div>
              {friends.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-20 text-center">
                  <p className="text-gray-500">{searchTerm ? 'Không tìm thấy bạn bè nào' : 'Bạn chưa có bạn bè nào'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {friends.map((friendship) => (
                    <div key={friendship.friendshipId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl flex flex-col items-center group active:scale-[0.98]">
                      <Link to={`/profile/${friendship.friend.id}`} className="w-28 h-28 bg-gray-300 dark:bg-gray-700 rounded-full mb-4 overflow-hidden shadow-md border-4 border-white dark:border-gray-800">
                        {friendship.friend.profilePicture ? (
                          <img src={friendship.friend.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-400 text-3xl font-extrabold uppercase">
                            {friendship.friend.firstName.charAt(0)}{friendship.friend.lastName.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <Link to={`/profile/${friendship.friend.id}`} className="font-extrabold text-gray-900 dark:text-white text-lg hover:text-facebook-600 dark:hover:text-facebook-400 transition-colors mb-5 text-center truncate w-full">
                        {friendship.friend.firstName} {friendship.friend.lastName}
                      </Link>
                      <div className="w-full space-y-2.5">
                        <Link
                          to={`/messenger/${friendship.friend.id}`}
                          className="w-full bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400 py-2.5 rounded-xl font-bold text-sm block text-center hover:bg-facebook-600 hover:text-white dark:hover:bg-facebook-600 dark:hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          Nhắn tin
                        </Link>
                        <button
                          onClick={() => handleUnfriend(friendship.friend.id)}
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                        >
                          Hủy kết bạn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Birthdays */}
          {activeTab === 'birthdays' && (
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-6">Sinh nhật hôm nay</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-20 text-center">
                <p className="text-gray-500">Không có ai sinh nhật hôm nay</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;