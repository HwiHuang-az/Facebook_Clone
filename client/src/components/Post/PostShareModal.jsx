import React, { useState } from 'react';
import { XMarkIcon, GlobeAmericasIcon, UsersIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PostShareModal = ({ post, onClose, onShareSuccess }) => {
    const { user } = useAuth();
    const [sharedContent, setSharedContent] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const res = await api.post(`/post-shares/${post.id}/share`, {
                sharedContent
            });
            if (res.data.success) {
                toast.success('Đã chia sẻ lên bảng tin của bạn');
                if (onShareSuccess) onShareSuccess(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Share error:', error);
            toast.error(error.response?.data?.message || 'Không thể chia sẻ bài viết');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden transition-all duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chia sẻ bài viết</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                                    {user?.firstName?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                            <div className="flex items-center space-x-1 mt-0.5 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md w-fit cursor-pointer">
                                <GlobeAmericasIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">Công khai</span>
                            </div>
                        </div>
                    </div>

                    {/* Input */}
                    <textarea
                        value={sharedContent}
                        onChange={(e) => setSharedContent(e.target.value)}
                        placeholder="Nói gì đó về bài viết này..."
                        className="w-full min-h-[100px] border-none focus:ring-0 text-lg text-gray-900 dark:text-white dark:bg-transparent resize-none p-0 mb-4"
                    />

                    {/* Original Post Preview */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4 opacity-80 scale-95 origin-top">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800">
                            <img
                                src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.author?.firstName}+${post.author?.lastName}`}
                                className="w-6 h-6 rounded-full"
                                alt=""
                            />
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {post.author?.firstName} {post.author?.lastName}
                            </p>
                        </div>
                        {post.content && (
                            <p className="p-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 bg-white dark:bg-gray-800">
                                {post.content}
                            </p>
                        )}
                        {post.imageUrl && (
                            <img src={post.imageUrl} className="w-full max-h-48 object-cover" alt="" />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right">
                    <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Thêm vào bài viết</span>
                        <div className="flex space-x-2">
                            {/* Dummy icons for look and feel */}
                            <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-not-allowed">
                                <GlobeAmericasIcon className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-not-allowed">
                                <UsersIcon className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostShareModal;
