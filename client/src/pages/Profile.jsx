import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useFriendships } from '../hooks/useFriendships';
import { toast } from 'react-hot-toast';
import CreateStoryModal from '../components/Profile/CreateStoryModal';
import EditProfileModal from '../components/Profile/EditProfileModal';
import ImageCropperModal from '../components/Profile/ImageCropperModal';
import PhotoPickerModal from '../components/Profile/PhotoPickerModal';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileIntro from '../components/Profile/ProfileIntro';
import ProfilePhotos from '../components/Profile/ProfilePhotos';
import ProfileFriends from '../components/Profile/ProfileFriends';
import ProfileFeed from '../components/Profile/ProfileFeed';
import ProfileAbout from '../components/Profile/ProfileAbout';

import CreatePostModal from '../components/Home/CreatePostModal';
import ProfileReels from '../components/Profile/ProfileReels';

const FriendItem = ({ friend }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => window.location.href = `/profile/${friend.id}`}
      className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {friend.profilePicture && !imgError ? (
        <img
          src={friend.profilePicture}
          className="w-20 h-20 rounded-lg object-cover"
          alt={friend.firstName}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-blue-600 flex items-center justify-center text-white text-2xl font-bold uppercase shrink-0">
          {(friend.firstName?.charAt(0) || '')}{(friend.lastName?.charAt(0) || '')}
        </div>
      )}
      <div className="flex-1">
        <p className="font-bold text-[17px] hover:underline">{friend.firstName} {friend.lastName}</p>
        <p className="text-sm text-gray-500">10 bạn chung</p>
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
  const [aboutSubTab, setAboutSubTab] = useState('overview');
  const [viewMode, setViewMode] = useState('list');
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [cropType, setCropType] = useState(null);

  // Add Photo Feature State
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [initialPostImage, setInitialPostImage] = useState(null);
  const photoInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInitialPostImage(file);
      setIsCreatePostModalOpen(true);
      // Reset input value so same file can be selected again
      e.target.value = null;
    }
  };

  const profileInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);

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

  const handleSourceSelect = (source, type) => {
    setCropImage(source);
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
        await api.post('/friendships/reject-request', { friendshipId });
        toast.success(actionType === 'cancel' ? 'Đã hủy yêu cầu' : 'Đã từ chối lời mời');
      } else if (actionType === 'unfriend') {
        await unfriend(targetId);
        toast.success('Đã hủy kết bạn');
      }
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

  const { user, friendshipStatus, isOwnProfile, friendsCount } = profileData || {};

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hidden File Inputs */}
      <input type="file" ref={profileInputRef} onChange={(e) => handleFileSelect(e, 'profile')} className="hidden" accept="image/*" />
      <input type="file" ref={coverInputRef} onChange={(e) => handleFileSelect(e, 'cover')} className="hidden" accept="image/*" />

      {/* Profile Header */}
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        friendsCount={friendsCount}
        friends={friends}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        actionLoading={actionLoading}
        handleFriendAction={handleFriendAction}
        friendshipStatus={friendshipStatus}
        setIsEditModalOpen={setIsEditModalOpen}
        setIsStoryModalOpen={setIsStoryModalOpen}
        setPickerType={setPickerType}
        setIsPhotoPickerOpen={setIsPhotoPickerOpen}
      />

      {/* Profile Page Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column - Intro & Photos Sidebar */}
          {activeTab === 'posts' && (
            <div className="lg:w-[40%] space-y-4 text-gray-900">
              <ProfileIntro
                user={user}
                isOwnProfile={isOwnProfile}
                setIsEditModalOpen={setIsEditModalOpen}
              />
              <ProfilePhotos posts={posts} />
              <ProfileFriends
                friends={friends}
                friendsCount={friendsCount}
                setActiveTab={setActiveTab}
              />
            </div>
          )}

          {/* Right Column - Timeline/Feed */}
          <div className={`space-y-4 ${activeTab === 'posts' ? 'lg:w-[60%]' : 'lg:w-full'}`}>
            {activeTab === 'posts' && (
              <ProfileFeed
                user={user}
                isOwnProfile={isOwnProfile}
                posts={posts}
                postLoading={postLoading}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}

            {activeTab === 'about' && (
              <ProfileAbout
                user={user}
                aboutSubTab={aboutSubTab}
                setAboutSubTab={setAboutSubTab}
              />
            )}

            {/* Friends Tab Content - Keeping inline for now as it's simple enough or could be another component */}
            {activeTab === 'friends' && (
              <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Bạn bè</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm bạn bè"
                        className="bg-gray-100 rounded-full py-1.5 px-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button className="text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50">Lời mời kết bạn</button>
                    <button className="text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50">Tìm bạn bè</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <FriendItem key={friend.id} friend={friend} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-20 text-gray-500 font-bold">
                      Chưa có bạn bè nào để hiển thị
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Photos Tab Content */}
            {activeTab === 'photos' && (
              <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Ảnh</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center space-x-1"
                    >
                      <span>Thêm ảnh</span>
                    </button>
                    <input
                      type="file"
                      ref={photoInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {posts.filter(p => p.imageUrl).length > 0 ? (
                    posts.filter(p => p.imageUrl).map((post) => (
                      <div key={post.id} className="aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-95 transition-opacity">
                        <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 text-gray-500 font-bold">
                      Chưa có ảnh nào để hiển thị
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reels' && (
              <ProfileReels
                posts={posts}
                isOwnProfile={isOwnProfile}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={fetchProfile}
        />
      )}

      {cropImage && (
        <ImageCropperModal
          imageSrc={cropImage}
          type={cropType}
          onClose={() => setCropImage(null)}
          onCropComplete={performUpload}
        />
      )}

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

      {isStoryModalOpen && (
        <CreateStoryModal
          onClose={() => setIsStoryModalOpen(false)}
          onCreated={fetchProfile}
        />
      )}
      {/* Create Post Modal for "Add Photo" */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        initialImage={initialPostImage}
        onPostCreated={() => {
          // Refresh posts? 
          // Currently posts are fetched on mount/update. 
          // Ideally we should refetch posts here.
          // But simple close is fine for now as user might not expect instant update on photos tab immediately without refresh or maybe we can append?
          // Since CreatePost calls onPostCreated, we can trigger a refetch if we had a function.
          // For now just close.
          setIsCreatePostModalOpen(false);
          window.location.reload(); // Simple reload to show new photo
        }}
      />
    </div>
  );
};

export default Profile;
