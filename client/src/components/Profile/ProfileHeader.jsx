import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    CameraIcon,
    PlusIcon,
    PencilIcon,
    EllipsisHorizontalIcon,
    ChevronDownIcon,
    MapPinIcon,
    FlagIcon
} from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import ReportModal from '../Shared/ReportModal';



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
    setIsPhotoPickerOpen,
    onProfileUpdate
}) => {
    const navigate = useNavigate();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [loadingBlock, setLoadingBlock] = useState(false);

    useEffect(() => {
        const checkBlockStatus = async () => {
            if (!user?.id || isOwnProfile) return;
            try {
                const res = await api.get(`/blocked-users/check/${user.id}`);
                if (res.data.success) {
                    setIsBlocked(res.data.isBlocked);
                }
            } catch (error) {
                console.error('Check block status error:', error);
            }
        };
        checkBlockStatus();
    }, [user?.id, isOwnProfile]);

    const handleMessageClick = () => {
        navigate('/messages', { state: { targetUser: user } });
    };

    const handleBlockToggle = async () => {
        if (!user?.id) return;
        const confirmMsg = isBlocked 
            ? `Bạn có chắc chắn muốn bỏ chặn ${user.firstName}?` 
            : `Bạn có chắc chắn muốn chặn ${user.firstName}? Người này sẽ không thể xem profile hoặc nhắn tin cho bạn.`;
        
        if (!window.confirm(confirmMsg)) return;

        try {
            setLoadingBlock(true);
            if (isBlocked) {
                const res = await api.get(`/blocked-users`); 
                const block = res.data.data.find(b => b.blockedId === user.id);
                if (block) {
                    await api.delete(`/blocked-users/${block.id}`);
                    setIsBlocked(false);
                    toast.success('Đã bỏ chặn');
                }
            } else {
                await api.post(`/blocked-users`, { userId: user.id });
                setIsBlocked(true);
                toast.success('Đã chặn người dùng');
                navigate('/');
            }
        } catch (error) {
            console.error('Block toggle error:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoadingBlock(false);
        }
    };

    const renderFriendButtons = () => {

        if (isOwnProfile) return null;
        if (friendshipStatus === 'none') {
            return (
                <button
                    onClick={() => handleFriendAction('send')}
                    disabled={actionLoading}
                    className="bg-facebook-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-facebook-700 transition-all shadow-md active:scale-95"
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
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm"
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
                        className="bg-facebook-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-facebook-700 transition-all shadow-md active:scale-95"
                    >
                        Chấp nhận
                    </button>
                    <button
                        onClick={() => handleFriendAction('reject')}
                        disabled={actionLoading}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm"
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
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm"
                >
                    {actionLoading ? 'Đang hủy...' : '🔒 Bạn bè'}
                </button>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-facebook overflow-hidden transition-colors duration-200">
            <div className="max-w-5xl mx-auto">
                {/* Cover Photo Area */}
                <div className="relative group">
                    <div className="h-48 md:h-[350px] w-full bg-gray-200 dark:bg-gray-700 rounded-b-2xl overflow-hidden relative shadow-inner">
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
                                className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center space-x-2 z-20 active:scale-95 border border-gray-100 dark:border-gray-700"
                            >
                                <CameraIcon className="h-5 w-5" />
                                <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
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
                                        <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-facebook-600 text-white text-5xl font-extrabold select-none uppercase tracking-tighter shadow-inner">
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
                                        className="absolute bottom-2 right-2 p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-lg border border-white dark:border-gray-800 active:scale-90"
                                    >
                                        <CameraIcon className="h-5 w-5 text-gray-900 dark:text-white" />
                                    </button>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="text-center md:text-left pb-2">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <div className="flex flex-col md:flex-row items-center md:space-x-2 mt-1">
                                    <span className="text-gray-500 dark:text-gray-400 font-bold text-[15px]">{friendsCount || 0} bạn bè</span>
                                    {user?.location && (
                                        <>
                                            <span className="hidden md:inline text-gray-400">•</span>
                                            <div className="flex items-center text-gray-500 dark:text-gray-400">
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
                                        className="bg-facebook-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-facebook-700 transition-all shadow-md active:scale-95 flex items-center space-x-2"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        <span>Thêm vào tin</span>
                                    </button>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 flex items-center space-x-2 shadow-sm border border-gray-200 dark:border-gray-600"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        <span>Chỉnh sửa</span>
                                    </button>
                                    <button className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm border border-gray-200 dark:border-gray-600">
                                        <ChevronDownIcon className="h-5 w-5 text-gray-900 dark:text-white" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex space-x-2">
                                    {renderFriendButtons()}
                                    <button
                                        onClick={handleMessageClick}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm border border-gray-200 dark:border-gray-600"
                                    >
                                        Nhắn tin
                                    </button>
                                    <button
                                        onClick={handleBlockToggle}
                                        disabled={loadingBlock}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm ${isBlocked ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'}`}
                                    >
                                        {isBlocked ? 'Bỏ chặn' : 'Chặn'}
                                    </button>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm border border-gray-200 dark:border-gray-600"
                                        title="Báo cáo người dùng"
                                    >
                                        <FlagIcon className="h-5 w-5" />
                                    </button>
                                </div>

                            )}
                        </div>
                    </div>

                    <ReportModal 
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        targetType="user"
                        targetId={user?.id}
                        targetName={`${user?.firstName} ${user?.lastName}`}
                    />

                    <div className="border-t dark:border-gray-700 mt-4"></div>

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
                                        "px-4 py-4 text-[15px] font-bold transition-all relative whitespace-nowrap",
                                        activeTab === tab.id ? "text-facebook-600 dark:text-facebook-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl my-1"
                                    )}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{tab.label}</span>
                                        {tab.hasArrow && <ChevronDownIcon className="h-4 w-4" />}
                                    </div>
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-4 right-4 h-1 bg-facebook-600 dark:bg-facebook-400 rounded-t-xl shadow-[0_-2px_8px_rgba(24,119,242,0.3)]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* More Desktop Actions */}
                        <div className="hidden md:flex py-1 items-center">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 transition-all active:scale-95">
                                <EllipsisHorizontalIcon className="h-6 w-6 text-gray-900 dark:text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
