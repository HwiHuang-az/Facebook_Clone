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
    <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'error'
          ? 'bg-red-100 border border-red-400 text-red-700'
          : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
          {notification.message}
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
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Friend Suggestions */}
          {activeTab === 'suggestions' && (
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-6">Những người bạn có thể biết</h2>
              {suggestions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-20 text-center">
                  <p className="text-gray-500">Không có gợi ý kết bạn nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                      <Link to={`/profile/${suggestion.id}`} className="block h-48 bg-gray-200">
                        {suggestion.profilePicture ? (
                          <img src={suggestion.profilePicture} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-4xl font-bold">
                            {suggestion.firstName.charAt(0)}{suggestion.lastName.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <div className="p-4">
                        <Link to={`/profile/${suggestion.id}`} className="font-bold text-gray-900 dark:text-white hover:underline block mb-3">
                          {suggestion.firstName} {suggestion.lastName}
                        </Link>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleSendRequest(suggestion.id)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                          >
                            Thêm bạn bè
                          </button>
                          <button
                            onClick={() => removeSuggestion(suggestion.id)}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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
                    <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                      <Link to={`/profile/${request.user1?.id}`} className="block h-48 bg-gray-200">
                        {request.user1?.profilePicture ? (
                          <img src={request.user1?.profilePicture} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-4xl font-bold">
                            {request.user1?.firstName.charAt(0)}{request.user1?.lastName.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <div className="p-4">
                        <Link to={`/profile/${request.user1?.id}`} className="font-bold text-gray-900 dark:text-white hover:underline block mb-1">
                          {request.user1?.firstName} {request.user1?.lastName}
                        </Link>
                        <p className="text-xs text-gray-500 mb-4">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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
                <div className="relative w-64">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bạn bè"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm dark:text-white"
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
                    <div key={friendship.friendshipId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 transition-all hover:shadow-md flex flex-col items-center">
                      <Link to={`/profile/${friendship.friend.id}`} className="w-24 h-24 bg-gray-300 rounded-full mb-3 overflow-hidden group">
                        {friendship.friend.profilePicture ? (
                          <img src={friendship.friend.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-2xl font-bold">
                            {friendship.friend.firstName.charAt(0)}{friendship.friend.lastName.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <Link to={`/profile/${friendship.friend.id}`} className="font-bold text-gray-900 dark:text-white hover:underline mb-4 text-center">
                        {friendship.friend.firstName} {friendship.friend.lastName}
                      </Link>
                      <div className="w-full space-y-2">
                        <Link
                          to={`/messenger/${friendship.friend.id}`}
                          className="w-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 py-2 rounded-lg font-bold text-sm block text-center hover:bg-blue-200 transition"
                        >
                          Nhắn tin
                        </Link>
                        <button
                          onClick={() => handleUnfriend(friendship.friend.id)}
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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