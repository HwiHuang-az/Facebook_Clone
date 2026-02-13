import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
    CameraIcon,
    PlusIcon,
    PencilIcon,
    EllipsisHorizontalIcon,
    ChevronDownIcon,
    MapPinIcon
} from '@heroicons/react/24/solid';
import classNames from 'classnames';



const ProfileHeader = ({
    user,
    isOwnProfile,
    friendsCount,
    friends,
    activeTab,
    setActiveTab,
    actionLoading,
    handleFriendAction,
    friendshipStatus,
    setIsEditModalOpen,
    setIsStoryModalOpen,
    setPickerType,
    setIsPhotoPickerOpen
}) => {
    const navigate = useNavigate();

    const handleMessageClick = () => {
        navigate('/messages', { state: { targetUser: user } });
    };

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
        <div className="bg-white shadow-sm overflow-hidden">
            <div className="max-w-5xl mx-auto">
                {/* Cover Photo Area */}
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
                                className="absolute bottom-4 right-4 bg-white text-gray-900 px-3 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-colors flex items-center space-x-2 z-20"
                            >
                                <CameraIcon className="h-5 w-5" />
                                <span className="hidden md:inline font-semibold">Chỉnh sửa ảnh bìa</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Header Info & Actions */}
                <div className="px-4 md:px-8 pb-4">
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-12 md:-mt-16 relative z-10">
                        {/* Left Side: Profile Pic and Info */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                            {/* Profile Picture */}
                            <div className="relative group">
                                <div className="w-40 h-40 md:w-[168px] md:h-[168px] rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-5xl font-bold select-none uppercase">
                                            {(user?.firstName?.charAt(0) || '')}{(user?.lastName?.charAt(0) || '')}
                                        </div>
                                    )}
                                </div>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => {
                                            setPickerType('profile');
                                            setIsPhotoPickerOpen(true);
                                        }}
                                        className="absolute bottom-2 right-2 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
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
                                    <button
                                        onClick={handleMessageClick}
                                        className="bg-gray-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
                                    >
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
    );
};

export default ProfileHeader;
