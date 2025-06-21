import React, { useState, useEffect } from 'react';
import { useFriendships } from '../hooks/useFriendships';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  
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

  const tabs = [
    { id: 'suggestions', label: 'Gợi ý', count: suggestions.length },
    { id: 'requests', label: 'Lời mời kết bạn', count: requests.length },
    { id: 'all', label: 'Tất cả bạn bè', count: friends.length },
    { id: 'birthdays', label: 'Sinh nhật', count: 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-facebook p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Bạn bè</h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* Friend Suggestions */}
        {activeTab === 'suggestions' && (
          <div className="bg-white rounded-lg shadow-facebook p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Những người bạn có thể biết
            </h2>
            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không có gợi ý kết bạn nào</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                        {suggestion.profilePicture ? (
                          <img 
                            src={suggestion.profilePicture} 
                            alt={`${suggestion.firstName} ${suggestion.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-lg font-semibold">
                            {suggestion.firstName.charAt(0)}{suggestion.lastName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {suggestion.firstName} {suggestion.lastName}
                        {suggestion.isVerified && (
                          <span className="ml-1 text-blue-500">✓</span>
                        )}
                      </h3>
                      <div className="space-y-2">
                        <button 
                          onClick={() => handleSendRequest(suggestion.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                        >
                          Thêm bạn bè
                        </button>
                        <button 
                          onClick={() => removeSuggestion(suggestion.id)}
                          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
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
          <div className="bg-white rounded-lg shadow-facebook p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Lời mời kết bạn
            </h2>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không có lời mời kết bạn nào</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        {request.user1.profilePicture ? (
                          <img 
                            src={request.user1.profilePicture} 
                            alt={`${request.user1.firstName} ${request.user1.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-lg font-semibold">
                            {request.user1.firstName.charAt(0)}{request.user1.lastName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.user1.firstName} {request.user1.lastName}
                          {request.user1.isVerified && (
                            <span className="ml-1 text-blue-500">✓</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Xác nhận
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Friends */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-lg shadow-facebook p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Tất cả bạn bè ({friends.length})
              </h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {friends.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? 'Không tìm thấy bạn bè nào' : 'Bạn chưa có bạn bè nào'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {friends.map((friendship) => (
                  <div key={friendship.friendshipId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                        {friendship.friend.profilePicture ? (
                          <img 
                            src={friendship.friend.profilePicture} 
                            alt={`${friendship.friend.firstName} ${friendship.friend.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-lg font-semibold">
                            {friendship.friend.firstName.charAt(0)}{friendship.friend.lastName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {friendship.friend.firstName} {friendship.friend.lastName}
                        {friendship.friend.isVerified && (
                          <span className="ml-1 text-blue-500">✓</span>
                        )}
                      </h3>
                      <div className="space-y-2">
                        <button 
                          onClick={() => handleUnfriend(friendship.friend.id)}
                          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
                        >
                          Hủy kết bạn
                        </button>
                        <button className="w-full bg-blue-100 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-200">
                          Nhắn tin
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Birthdays */}
        {activeTab === 'birthdays' && (
          <div className="bg-white rounded-lg shadow-facebook p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sinh nhật hôm nay
            </h2>
            <p className="text-gray-500 text-center py-8">Không có ai sinh nhật hôm nay</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends; 