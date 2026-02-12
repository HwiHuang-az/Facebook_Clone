import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Post from '../components/Home/Post';
import CreatePost from '../components/Home/CreatePost';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const targetId = userId || currentUser?.id;
      if (!targetId) return;

      const res = await api.get(`/users/profile/${targetId}`);
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser]);

  const fetchUserPosts = useCallback(async () => {
    try {
      setPostLoading(true);
      const targetId = userId || currentUser?.id;
      if (!targetId) return;

      const res = await api.get(`/posts/user/${targetId}`);
      if (res.data.success) {
        setPosts(res.data.data.posts);
      }
    } catch (error) {
      console.error('Fetch user posts error:', error);
    } finally {
      setPostLoading(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [fetchProfile, fetchUserPosts]);

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isOwnProfile = !userId || userId === currentUser?.id.toString();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Photo */}
      <div className="bg-white rounded-lg shadow-facebook overflow-hidden mb-4">
        <div className="h-48 md:h-80 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          {user?.coverPhoto && (
            <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute -bottom-12 left-4 md:left-8 flex items-end space-x-4">
            <div className="w-24 h-24 md:w-40 md:h-40 bg-gray-300 rounded-full border-4 border-white overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold">
                  {user?.firstName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="mb-14">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-white opacity-90 drop-shadow-sm font-medium">1,234 bạn bè</p>
            </div>
          </div>
        </div>

        <div className="h-16 md:h-20 bg-white"></div>

        {/* Profile Actions */}
        <div className="p-4 flex justify-end items-center border-b">
          <div className="flex space-x-2">
            {isOwnProfile ? (
              <>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  + Thêm vào tin
                </button>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  ✏️ Chỉnh sửa trang cá nhân
                </button>
              </>
            ) : (
              <>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Thêm bạn bè
                </button>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Nhắn tin
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="px-4">
          <div className="flex space-x-1 md:space-x-8 text-gray-600 font-semibold overflow-x-auto whitespace-nowrap">
            <button className="py-4 border-b-4 border-blue-600 text-blue-600 px-2 md:px-4 transition-all">
              Bài viết
            </button>
            <button className="py-4 hover:bg-gray-100 px-2 md:px-4 rounded-md transition-colors">
              Giới thiệu
            </button>
            <button className="py-4 hover:bg-gray-100 px-2 md:px-4 rounded-md transition-colors">
              Bạn bè
            </button>
            <button className="py-4 hover:bg-gray-100 px-2 md:px-4 rounded-md transition-colors">
              Ảnh
            </button>
            <button className="py-4 hover:bg-gray-100 px-2 md:px-4 rounded-md transition-colors">
              Video
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Intro */}
          <div className="bg-white rounded-lg shadow-facebook p-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Giới thiệu</h3>
            <div className="space-y-4 text-gray-700">
              {user?.bio && <p className="text-center italic text-gray-600 pb-2 border-b">{user.bio}</p>}
              <div className="flex items-center space-x-3">
                <span className="text-xl">🏢</span>
                <span>{user?.work ? `Làm việc tại ${user.work}` : 'Chưa cập nhật nơi làm việc'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">🎓</span>
                <span>{user?.education ? `Học tại ${user.education}` : 'Chưa cập nhật học vấn'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">📍</span>
                <span>{user?.location ? `Sống tại ${user.location}` : 'Chưa cập nhật địa chỉ'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">💞</span>
                <span className="capitalize">{user?.relationshipStatus || 'Độc thân'}</span>
              </div>
            </div>
            {isOwnProfile && (
              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 py-2 rounded-lg transition-colors">
                Chỉnh sửa chi tiết
              </button>
            )}
          </div>

          {/* Photos (Mock) */}
          <div className="bg-white rounded-lg shadow-facebook p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-gray-900">Ảnh</h3>
              <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">Xem tất cả</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((photo) => (
                <div key={photo} className="aspect-square bg-gray-200 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Create Post */}
          {isOwnProfile && <CreatePost onPostCreated={fetchUserPosts} />}

          {/* Posts Feed */}
          <div className="space-y-4">
            {postLoading ? (
              <div className="text-center py-4 text-gray-500">Đang tải bài viết...</div>
            ) : posts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-facebook text-center text-gray-500">
                Chưa có bài viết nào để hiển thị.
              </div>
            ) : (
              posts.map((post) => (
                <Post key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 