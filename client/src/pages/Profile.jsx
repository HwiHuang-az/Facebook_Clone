import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Post from '../components/Home/Post';
import { useAuth } from '../hooks/useAuth';
import { useFriendships } from '../hooks/useFriendships';
import { toast } from 'react-hot-toast';
import CreateStoryModal from '../components/Profile/CreateStoryModal';
import EditProfileModal from '../components/Profile/EditProfileModal';
import ImageCropperModal from '../components/Profile/ImageCropperModal';
import PhotoPickerModal from '../components/Profile/PhotoPickerModal';
import {
  CameraIcon,
  PlusIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  VideoCameraIcon,
  PhotoIcon,
  FlagIcon,
  AdjustmentsVerticalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  AcademicCapIcon,
  HomeIcon,
  HeartIcon,
  UserIcon,
  CakeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';
import {
  MapPinIcon
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

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
    <div className="bg-gray-100 min-h-screen">
      {/* Hidden File Inputs */}
      <input type="file" ref={profileInputRef} onChange={(e) => handleFileSelect(e, 'profile')} className="hidden" accept="image/*" />
      <input type="file" ref={coverInputRef} onChange={(e) => handleFileSelect(e, 'cover')} className="hidden" accept="image/*" />

      {/* Header Container */}
      <div className="bg-white shadow-sm overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Cover Photo Area - Limited scope for absolute overlays */}
          <div className="relative group">
            <div className="h-48 md:h-[350px] w-full bg-gray-200 rounded-b-lg overflow-hidden relative">
              {user?.coverPhoto ? (
                <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-300"></div>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => {
                    setPickerType('cover');
                    setIsPhotoPickerOpen(true);
                  }}
                  className="absolute bottom-4 right-4 bg-white text-gray-900 px-3 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-colors flex items-center space-x-2 z-10"
                >
                  <CameraIcon className="h-5 w-5" />
                  <span className="hidden md:inline font-semibold">Chỉnh sửa ảnh bìa</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Header Info & Actions (Flow Area) */}
          <div className="px-4 md:px-8 pb-4">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-12 md:-mt-16 relative z-10">
              {/* Left Side: Profile Pic and Info */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                {/* Profile Picture (Now in flow, but with negative margin to overlap) */}
                <div className="relative group">
                  <div className="w-40 h-40 md:w-[168px] md:h-[168px] rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-5xl font-bold">
                        {user?.firstName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        setPickerType('profile');
                        setIsPhotoPickerOpen(true);
                      }}
                      className="absolute bottom-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors shadow-sm border border-white"
                    >
                      <CameraIcon className="h-5 w-5 text-gray-900" />
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="text-center md:text-left pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <div className="flex flex-col md:flex-row items-center md:space-x-2 mt-1">
                    <span className="text-gray-600 font-bold text-[15px]">{friendsCount || 0} bạn bè</span>
                    {user?.location && (
                      <>
                        <span className="hidden md:inline text-gray-400">•</span>
                        <div className="flex items-center text-gray-400">
                          <MapPinIcon className="h-4 w-4 mr-0.5" />
                          <span className="text-[14px] font-bold">{user.location}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Friends Avatars Preview */}
                  {friends.length > 0 && (
                    <div className="flex mt-2 justify-center md:justify-start -space-x-2 overflow-hidden">
                      {friends.slice(0, 8).map((friend, i) => (
                        <img
                          key={friend.id}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200"
                          src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}`}
                          alt=""
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Small Action Buttons */}
              <div className="flex items-center gap-2 pb-2">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsStoryModalOpen(true)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center space-x-1.5"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Thêm vào tin</span>
                    </button>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-gray-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors flex items-center space-x-1.5"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Chỉnh sửa</span>
                    </button>
                    <button className="bg-gray-200 p-1.5 rounded-lg hover:bg-gray-300 transition-colors">
                      <ChevronDownIcon className="h-4 w-4 text-gray-900" />
                    </button>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    {renderFriendButtons()}
                    <button className="bg-gray-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors">
                      Nhắn tin
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t mt-4"></div>

            {/* Desktop Navigation */}
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex overflow-x-auto no-scrollbar py-1 w-full md:w-auto">
                {[
                  { id: 'posts', label: 'Tất cả' },
                  { id: 'about', label: 'Giới thiệu' },
                  { id: 'friends', label: 'Bạn bè' },
                  { id: 'photos', label: 'Ảnh' },
                  { id: 'reels', label: 'Reels' },
                  { id: 'more', label: 'Xem thêm', hasArrow: true },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => tab.id !== 'more' && setActiveTab(tab.id)}
                    className={classNames(
                      "px-4 py-4 text-[15px] font-semibold transition-colors relative whitespace-nowrap",
                      activeTab === tab.id ? "text-blue-600" : "text-gray-600 hover:bg-gray-100 rounded-lg my-1"
                    )}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{tab.label}</span>
                      {tab.hasArrow && <ChevronDownIcon className="h-4 w-4" />}
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-4 right-4 h-1 bg-blue-600 rounded-t-lg"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* More Desktop Actions */}
              <div className="hidden md:flex py-1 items-center">
                <div className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 cursor-pointer flex items-center justify-center">
                  <EllipsisHorizontalIcon className="h-5 w-5 text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Page Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column - Intro & Photos Sidebar */}
          {activeTab === 'posts' && (
            <div className="lg:w-[40%] space-y-4 text-gray-900">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                  {isOwnProfile && <PencilIcon className="h-4 w-4 text-gray-500 cursor-pointer hover:bg-gray-100 p-1 rounded" />}
                </div>

                <div className="space-y-4">
                  {user?.location && (
                    <div className="flex items-start space-x-3 text-[15px]">
                      <HomeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>Sống ở <span className="font-bold">{user.location}</span></span>
                    </div>
                  )}
                  {user?.hometown && (
                    <div className="flex items-start space-x-3 text-[15px]">
                      <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>Đến từ <span className="font-bold">{user.hometown}</span></span>
                    </div>
                  )}
                  {user?.dateOfBirth && (
                    <div className="flex items-start space-x-3 text-[15px]">
                      <CakeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>Sinh nhật <span className="font-bold">{new Date(user.dateOfBirth).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
                    </div>
                  )}
                  <div className="flex items-start space-x-3 text-[15px]">
                    <HeartIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                    <span className="capitalize">{user?.relationshipStatus ? (user.relationshipStatus === 'single' ? 'Độc thân' : user.relationshipStatus === 'in_relationship' ? 'Hẹn hò' : user.relationshipStatus === 'married' ? 'Đã kết hôn' : 'Phức tạp') : 'Độc thân'}</span>
                  </div>
                  {user?.gender && (
                    <div className="flex items-start space-x-3 text-[15px]">
                      <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work & Education Section */}
              {(user?.work || user?.education) && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Công việc & Học vấn</h2>
                    {isOwnProfile && (
                      <button onClick={() => setIsEditModalOpen(true)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {user?.work && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                          {user.work.substring(0, 4).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[15px]">{user.work}</p>
                          <p className="text-sm text-gray-500">Nhân viên</p>
                        </div>
                      </div>
                    )}
                    {user?.education && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                          {user.education.substring(0, 4).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[15px]">{user.education}</p>
                          <p className="text-sm text-gray-500">Sinh viên</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photos Widget */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Ảnh</h2>
                  <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-semibold text-[15px]">Xem tất cả ảnh</button>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden min-h-[100px]">
                  {posts.filter(p => p.imageUrl).slice(0, 9).length > 0 ? (
                    posts.filter(p => p.imageUrl).slice(0, 9).map((post, i) => (
                      <img key={i} src={post.imageUrl} className="h-28 w-full object-cover hover:opacity-90 cursor-pointer shadow-sm border" alt="" />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4 text-gray-500 text-sm">Chưa có ảnh nào</div>
                  )}
                </div>
              </div>

              {/* Friends Widget */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Bạn bè</h2>
                    <span className="text-gray-500 text-[15px]">{friendsCount || 0} người bạn</span>
                  </div>
                  <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-semibold text-[15px]">Xem tất cả bạn bè</button>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                  {friends.slice(0, 9).map((friend) => (
                    <div key={friend.id} onClick={() => { setActiveTab('posts'); window.location.href = `/profile/${friend.id}` }} className="cursor-pointer group">
                      <img
                        src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}`}
                        className="h-28 w-full object-cover rounded-lg group-hover:opacity-90 shadow-sm"
                        alt=""
                      />
                      <p className="text-[13px] font-bold mt-1 truncate">{friend.firstName} {friend.lastName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right Column - Timeline/Feed */}
          <div className={classNames(
            "space-y-4",
            activeTab === 'posts' ? "lg:w-[60%]" : "lg:w-full"
          )}>
            {activeTab === 'posts' && (
              <>
                {isOwnProfile && (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} className="w-10 h-10 rounded-full" alt="" />
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full py-2 px-4 text-left text-gray-500">
                        Bạn đang nghĩ gì?
                      </button>
                    </div>
                    <div className="flex border-t pt-2">
                      <button className="flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg space-x-2 transition-colors">
                        <VideoCameraIcon className="h-6 w-6 text-red-500" />
                        <span className="text-gray-600 font-semibold text-sm">Video trực tiếp</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg space-x-2 transition-colors">
                        <PhotoIcon className="h-6 w-6 text-green-500" />
                        <span className="text-gray-600 font-semibold text-sm">Ảnh/video</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg space-x-2 transition-colors">
                        <FlagIcon className="h-6 w-6 text-blue-400" />
                        <span className="text-gray-600 font-semibold text-sm">Cột mốc</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Post Management Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Bài viết</h2>
                    <div className="flex space-x-2">
                      <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm font-semibold">
                        <AdjustmentsVerticalIcon className="h-5 w-5" />
                        <span>Bộ lọc</span>
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm font-semibold">
                        <Cog6ToothIcon className="h-5 w-5" />
                        <span>Quản lý bài viết</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex border-t pt-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={classNames(
                        "flex-1 flex items-center justify-center py-2 transition-colors",
                        viewMode === 'list' ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <ListBulletIcon className="h-5 w-5 mr-2" />
                      <span className="font-semibold text-sm">Chế độ xem danh sách</span>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={classNames(
                        "flex-1 flex items-center justify-center py-2 transition-colors",
                        viewMode === 'grid' ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Squares2X2Icon className="h-5 w-5 mr-2" />
                      <span className="font-semibold text-sm">Chế độ xem lưới</span>
                    </button>
                  </div>
                </div>

                <div className={classNames(
                  "space-y-4",
                  viewMode === 'grid' ? "grid grid-cols-3 gap-1 space-y-0" : ""
                )}>
                  {postLoading ? (
                    <div className={classNames(
                      "text-center py-10 bg-white rounded-lg shadow-sm w-full",
                      viewMode === 'grid' ? "col-span-3" : ""
                    )}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className={classNames(
                      "bg-white p-10 text-center rounded-lg shadow-sm text-gray-500 font-bold border w-full",
                      viewMode === 'grid' ? "col-span-3" : ""
                    )}>
                      Chưa có bài viết nào
                    </div>
                  ) : viewMode === 'list' ? (
                    posts.map((post) => (
                      <Post key={post.id} post={post} />
                    ))
                  ) : (
                    posts.filter(p => p.imageUrl).map((post) => (
                      <div key={post.id} className="aspect-square w-full relative group cursor-pointer">
                        <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]">
                {/* About Tabs Sidebar */}
                <div className="w-full md:w-1/3 bg-gray-50 border-r py-2">
                  <h2 className="px-4 py-2 text-xl font-bold mb-2">Giới thiệu</h2>
                  {[
                    { id: 'overview', label: 'Tổng quan' },
                    { id: 'work', label: 'Công việc và học vấn' },
                    { id: 'places', label: 'Nơi từng sống' },
                    { id: 'contact', label: 'Thông tin liên hệ và cơ bản' },
                    { id: 'family', label: 'Gia đình và các mối quan hệ' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setAboutSubTab(sub.id)}
                      className={classNames(
                        "w-full text-left px-4 py-2.5 text-[15px] font-semibold transition-colors",
                        aboutSubTab === sub.id ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* About Content Area */}
                <div className="flex-1 p-6">
                  {aboutSubTab === 'overview' && (
                    <div className="space-y-6">
                      <h3 className="text-[17px] font-bold">Tổng quan</h3>
                      <div className="space-y-4">
                        {user?.work && (
                          <div className="flex items-center space-x-3 text-gray-600">
                            <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                            <span>Làm việc tại <span className="font-bold text-gray-900">{user.work}</span></span>
                          </div>
                        )}
                        {user?.education && (
                          <div className="flex items-center space-x-3 text-gray-600">
                            <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                            <span>Từng học tại <span className="font-bold text-gray-900">{user.education}</span></span>
                          </div>
                        )}
                        {user?.location && (
                          <div className="flex items-center space-x-3 text-gray-600">
                            <HomeIcon className="h-6 w-6 text-gray-400" />
                            <span>Sống tại <span className="font-bold text-gray-900">{user.location}</span></span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3 text-gray-600">
                          <HeartIcon className="h-6 w-6 text-gray-400" />
                          <span>{user?.relationshipStatus === 'single' ? 'Độc thân' : 'Trong một mối quan hệ'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'work' && (
                    <div className="space-y-6">
                      <h3 className="text-[17px] font-bold">Công việc và học vấn</h3>
                      <div className="space-y-8">
                        <div>
                          <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Công việc</p>
                          {user?.work ? (
                            <div className="flex items-center space-x-3">
                              <BriefcaseIcon className="h-8 w-8 text-gray-400" />
                              <div>
                                <p className="font-bold">{user.work}</p>
                                <p className="text-sm text-gray-500">Nhân viên</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Chưa có thông tin công việc</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Học vấn</p>
                          {user?.education ? (
                            <div className="flex items-center space-x-3">
                              <AcademicCapIcon className="h-8 w-8 text-gray-400" />
                              <div>
                                <p className="font-bold">{user.education}</p>
                                <p className="text-sm text-gray-500">Sinh viên</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Chưa có thông tin học vấn</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'places' && (
                    <div className="space-y-6">
                      <h3 className="text-[17px] font-bold">Nơi từng sống</h3>
                      <div className="space-y-4">
                        {user?.location && (
                          <div className="flex items-center space-x-3">
                            <HomeIcon className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="font-bold">{user.location}</p>
                              <p className="text-sm text-gray-500">Tỉnh/Thành phố hiện tại</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'contact' && (
                    <div className="space-y-6">
                      <h3 className="text-[17px] font-bold">Thông tin liên hệ và cơ bản</h3>
                      <div className="space-y-8">
                        <div>
                          <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Thông tin liên hệ</p>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                              <div>
                                <p className="font-bold">{user.email}</p>
                                <p className="text-sm text-gray-500">Email</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Thông tin cơ bản</p>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <CakeIcon className="h-6 w-6 text-gray-400" />
                              <div>
                                <p className="font-bold">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Chưa cập nhật'}</p>
                                <p className="text-sm text-gray-500">Ngày sinh</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                              <div>
                                <p className="font-bold">{user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}</p>
                                <p className="text-sm text-gray-500">Giới tính</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'family' && (
                    <div className="space-y-6">
                      <h3 className="text-[17px] font-bold">Gia đình và các mối quan hệ</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <HeartIcon className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-bold">{user?.relationshipStatus ? (user.relationshipStatus === 'single' ? 'Độc thân' : user.relationshipStatus === 'in_relationship' ? 'Hẹn hò' : user.relationshipStatus === 'married' ? 'Đã kết hôn' : 'Phức tạp') : 'Độc thân'}</p>
                            <p className="text-sm text-gray-500">Tình trạng mối quan hệ</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Bạn bè</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm bạn bè"
                      className="bg-gray-100 rounded-full py-1.5 px-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => window.location.href = `/profile/${friend.id}`}
                        className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}`}
                          className="w-20 h-20 rounded-lg object-cover"
                          alt=""
                        />
                        <div className="flex-1">
                          <p className="font-bold text-[17px] hover:underline">{friend.firstName} {friend.lastName}</p>
                          <p className="text-sm text-gray-500">10 bạn chung</p>
                        </div>
                        <button className="p-2 hover:bg-gray-200 rounded-full">
                          <EllipsisHorizontalIcon className="h-6 w-6 text-gray-600" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-20 text-gray-500 font-bold">
                      Chưa có bạn bè nào để hiển thị
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Ảnh</h2>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50">Lời mời kết bạn</button>
                    <button className="text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50">Tìm bạn bè</button>
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

            {activeTab === 'videos' && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center text-gray-500 border">
                <div className="text-4xl mb-4">🎬</div>
                <p className="font-bold text-xl">Tính năng đang phát triển</p>
                <p>Mục này sẽ sớm có cập nhật dữ liệu thực tế.</p>
                <button onClick={() => setActiveTab('posts')} className="mt-4 text-blue-600 font-bold hover:underline">Quay lại Bài viết</button>
              </div>
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
    </div>
  );
};

export default Profile;
