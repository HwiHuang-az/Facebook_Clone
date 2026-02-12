import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Post from '../components/Home/Post';
import CreatePost from '../components/Home/CreatePost';
import { useAuth } from '../hooks/useAuth';
import { useFriendships } from '../hooks/useFriendships';
import { toast } from 'react-hot-toast';
import ImageCropperModal from '../components/Profile/ImageCropperModal';
import PhotoPickerModal from '../components/Profile/PhotoPickerModal';
import CreateStoryModal from '../components/Profile/CreateStoryModal';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    location: user.location || '',
    work: user.work || '',
    education: user.education || '',
    relationshipStatus: user.relationshipStatus || 'Độc thân',
  });
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/?depth=1');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Fetch provinces error:', error);
      }
    };
    fetchProvinces();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/users/profile', formData);
      if (res.data.success) {
        toast.success('Cập nhật thành công');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top duration-300">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-center flex-1">Chỉnh sửa trang cá nhân</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Họ</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tiểu sử</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" placeholder="Mô tả về bản thân..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">🏢 Công việc</label>
            <input name="work" value={formData.work} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Làm việc tại..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">🎓 Học vấn</label>
            <input name="education" value={formData.education} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Học tại..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">📍 Tỉnh/Thành phố hiện tại</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Chọn Tỉnh/Thành phố...</option>
              {provinces.map(p => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">💞 Tình trạng mối quan hệ</label>
            <select name="relationshipStatus" value={formData.relationshipStatus} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="Độc thân">Độc thân</option>
              <option value="Hẹn hò">Hẹn hò</option>
              <option value="Đã kết hôn">Đã kết hôn</option>
              <option value="Phức tạp">Phức tạp</option>
            </select>
          </div>
          <div className="pt-6 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Hủy</button>
            <button type="submit" disabled={loading} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { sendFriendRequest, acceptFriendRequest, unfriend } = useFriendships();

  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropType, setCropType] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const targetId = userId || currentUser?.id;
      if (!targetId) return;

      const res = await api.get(`/users/profile/${targetId}`);
      if (res.data.success) {
        setProfileData(res.data.data);
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

  const fetchFriends = useCallback(async () => {
    try {
      setFriendsLoading(true);
      const targetId = userId || currentUser?.id;
      if (!targetId) return;

      const res = await api.get(`/users/${targetId}/friends`);
      if (res.data.success) {
        setFriends(res.data.data.friends);
      }
    } catch (error) {
      console.error('Fetch friends error:', error);
    } finally {
      setFriendsLoading(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [fetchProfile, fetchUserPosts]);

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    }
  }, [activeTab, fetchFriends]);

  const profileInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);

  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState(null);

  const handleSourceSelect = (source, type) => {
    setCropImage(source); // source could be dataURL or external URL
    setCropType(type);
    setIsPhotoPickerOpen(false);
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropImage(reader.result);
      setCropType(type);
    });
    reader.readAsDataURL(file);
  };

  const performUpload = async (croppedBlob) => {
    if (!cropType) return;

    const formData = new FormData();
    formData.append('image', croppedBlob, 'updated-photo.jpg');

    try {
      setActionLoading(true);
      const url = cropType === 'profile' ? '/users/upload-profile-picture' : '/users/upload-cover-photo';
      const res = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success(`Cập nhật ${cropType === 'profile' ? 'ảnh đại diện' : 'ảnh bìa'} thành công`);
        setCropImage(null);
        fetchProfile();
      }
    } catch (error) {
      console.error(`${cropType} upload error:`, error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFriendAction = async (actionType) => {
    if (!profileData || actionLoading) return;

    try {
      setActionLoading(true);
      const targetId = profileData.user.id;
      const friendshipId = profileData.friendshipId;

      if (actionType === 'send') {
        await sendFriendRequest(targetId);
        toast.success('Đã gửi lời mời kết bạn');
      } else if (actionType === 'accept') {
        await acceptFriendRequest(friendshipId);
        toast.success('Đã chấp nhận lời mời kết bạn');
      } else if (actionType === 'cancel' || actionType === 'reject') {
        // Based on useFriendships, reject uses friendshipId.
        // Send request cancel might need a separate endpoint or reuse reject/delete.
        // For now, let's assume reject works for both if friendshipId is provided.
        await api.post('/friendships/reject-request', { friendshipId });
        toast.success(actionType === 'cancel' ? 'Đã hủy yêu cầu' : 'Đã từ chối lời mời');
      } else if (actionType === 'unfriend') {
        await unfriend(targetId);
        toast.success('Đã hủy kết bạn');
      }

      // Refresh profile to update status
      fetchProfile();
    } catch (error) {
      console.error('Friend action error:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { user, friendshipStatus, isOwnProfile, friendsCount, postsCount } = profileData || {};

  const renderFriendButtons = () => {
    if (isOwnProfile) return null;

    if (friendshipStatus === 'none') {
      return (
        <button
          onClick={() => handleFriendAction('send')}
          disabled={actionLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {actionLoading ? 'Đang gửi...' : 'Thêm bạn bè'}
        </button>
      );
    }

    if (friendshipStatus === 'sent') {
      return (
        <button
          onClick={() => handleFriendAction('cancel')}
          disabled={actionLoading}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          {actionLoading ? 'Đang hủy...' : 'Hủy yêu cầu'}
        </button>
      );
    }

    if (friendshipStatus === 'received') {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handleFriendAction('accept')}
            disabled={actionLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Chấp nhận
          </button>
          <button
            onClick={() => handleFriendAction('reject')}
            disabled={actionLoading}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Từ chối
          </button>
        </div>
      );
    }

    if (friendshipStatus === 'accepted') {
      return (
        <button
          onClick={() => handleFriendAction('unfriend')}
          disabled={actionLoading}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          {actionLoading ? 'Đang hủy...' : '🔒 Bạn bè'}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={profileInputRef}
        onChange={(e) => handleFileSelect(e, 'profile')}
        className="hidden"
        accept="image/*"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={(e) => handleFileSelect(e, 'cover')}
        className="hidden"
        accept="image/*"
      />

      {/* Cover Photo */}
      <div className="bg-white rounded-lg shadow-facebook overflow-hidden mb-4 relative group">
        <div className="h-48 md:h-80 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          {user?.coverPhoto && (
            <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          )}

          {isOwnProfile && (
            <button
              onClick={() => {
                setPickerType('cover');
                setIsPhotoPickerOpen(true);
              }}
              className="absolute bottom-4 right-4 bg-white text-gray-800 px-3 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <span>📷</span>
              <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
            </button>
          )}

          <div className="absolute -bottom-12 left-4 md:left-8 flex items-end space-x-4">
            <div className="w-24 h-24 md:w-40 md:h-40 bg-gray-300 rounded-full border-4 border-white overflow-hidden relative group">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold">
                  {user?.firstName?.charAt(0)}
                </div>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => {
                    setPickerType('profile');
                    setIsPhotoPickerOpen(true);
                  }}
                  className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <span className="text-white text-2xl">📷</span>
                </button>
              )}
            </div>
            <div className="mb-14">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-white opacity-90 drop-shadow-sm font-medium">{friendsCount || 0} bạn bè</p>
            </div>
          </div>
        </div>

        <div className="h-16 md:h-20 bg-white"></div>

        {/* Profile Actions */}
        <div className="p-4 flex justify-end items-center border-b">
          <div className="flex space-x-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setIsStoryModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  + Thêm vào tin
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  ✏️ Chỉnh sửa trang cá nhân
                </button>
              </>
            ) : (
              <>
                {renderFriendButtons()}
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Nhắn tin
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <EditProfileModal
            user={user}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={fetchProfile}
          />
        )}

        {/* Image Cropper Modal */}
        {cropImage && (
          <ImageCropperModal
            imageSrc={cropImage}
            type={cropType}
            onClose={() => setCropImage(null)}
            onCropComplete={performUpload}
          />
        )}

        {/* Photo Picker Modal */}
        {isPhotoPickerOpen && (
          <PhotoPickerModal
            userId={user?.id}
            type={pickerType}
            onClose={() => setIsPhotoPickerOpen(false)}
            onSelect={(url) => handleSourceSelect(url, pickerType)}
            onUploadClick={() => {
              setIsPhotoPickerOpen(false);
              if (pickerType === 'profile') profileInputRef.current.click();
              else coverInputRef.current.click();
            }}
          />
        )}

        {/* Create Story Modal */}
        {isStoryModalOpen && (
          <CreateStoryModal
            userId={user?.id}
            onClose={() => setIsStoryModalOpen(false)}
            onCreated={fetchProfile}
          />
        )}

        {/* Profile Tabs */}
        <div className="px-4">
          <div className="flex space-x-1 md:space-x-8 text-gray-600 font-semibold overflow-x-auto whitespace-nowrap">
            {['posts', 'intro', 'friends', 'photos', 'videos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 md:px-4 capitalize transition-all border-b-4 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent hover:bg-gray-100 rounded-md'
                  }`}
              >
                {tab === 'posts' ? 'Bài viết' :
                  tab === 'intro' ? 'Giới thiệu' :
                    tab === 'friends' ? 'Bạn bè' :
                      tab === 'photos' ? 'Ảnh' : 'Video'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Sidebar - Always show Intro on small screens, or as part of tabs on larger? 
            Facebook usually shows Intro/Photos/Friends on the left and Posts on the right. */}
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
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 py-2 rounded-lg transition-colors"
              >
                Chỉnh sửa chi tiết
              </button>
            )}
          </div>

          {/* Photos (Mock) */}
          <div className="bg-white rounded-lg shadow-facebook p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-gray-900">Ảnh</h3>
              <button onClick={() => setActiveTab('photos')} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">Xem tất cả</button>
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
          {activeTab === 'posts' && (
            <>
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
            </>
          )}

          {activeTab === 'intro' && (
            <div className="bg-white rounded-lg shadow-facebook p-6">
              <h3 className="text-2xl font-bold mb-4">Giới thiệu</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-500 text-sm mb-2">CÔNG VIỆC</h4>
                  <p className="text-lg">{user?.work || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 text-sm mb-2">HỌC VẤN</h4>
                  <p className="text-lg">{user?.education || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 text-sm mb-2">ĐỊA CHỈ</h4>
                  <p className="text-lg">{user?.location || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="bg-white rounded-lg shadow-facebook p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Bạn bè</h3>
                <span className="text-gray-500 font-medium">{friendsCount || 0} người bạn</span>
              </div>

              {friendsLoading ? (
                <div className="text-center py-10 text-gray-500">Đang tải danh sách bạn bè...</div>
              ) : friends.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Chưa có bạn bè nào để hiển thị.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-4 p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {friend.profilePicture ? (
                          <img src={friend.profilePicture} alt={friend.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold">
                            {friend.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 truncate">
                          {friend.firstName} {friend.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">80 bạn chung</p>
                      </div>
                      <button className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap">
                        Xem hồ sơ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white rounded-lg shadow-facebook p-6">
              <h3 className="text-2xl font-bold mb-6">Ảnh</h3>
              {posts.filter(p => p.imageUrl).length === 0 ? (
                <div className="text-center py-10 text-gray-500">Chưa có ảnh nào.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {posts.filter(p => p.imageUrl).map((post) => (
                    <div key={post.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group relative cursor-pointer shadow-sm border">
                      <img src={post.imageUrl} alt="User Post" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="bg-white rounded-lg shadow-facebook p-6">
              <h3 className="text-2xl font-bold mb-6">Video</h3>
              {posts.filter(p => p.videoUrl).length === 0 ? (
                <div className="text-center py-10 text-gray-500">Chưa có video nào.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.filter(p => p.videoUrl).map((post) => (
                    <div key={post.id} className="rounded-lg overflow-hidden bg-black aspect-video relative group border shadow-sm">
                      <video src={post.videoUrl} className="w-full h-full object-contain" controls />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 