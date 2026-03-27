import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import Comment from './Comment';
import { getPostComments, createComment } from '../../services/commentService';
import { toast } from 'react-hot-toast';
import VideoPlayer from '../Video/VideoPlayer';
import {
    HandThumbUpIcon as HandThumbUpIconSolid,
    FlagIcon
} from '@heroicons/react/24/solid';
import {
    HandThumbUpIcon,
    ChatBubbleOvalLeftIcon,
    ArrowUturnRightIcon,
    EllipsisHorizontalIcon,
    PaperAirplaneIcon,
    BookmarkIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import classNames from 'classnames';
import SavePostButton from '../Post/SavePostButton';
import PostShareModal from '../Post/PostShareModal';
import ReportModal from '../Shared/ReportModal';

const Post = ({ post, onPostUpdate, onPostDeleted, isAdmin = false }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount);
    const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
    const [loadingComments, setLoadingComments] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const [userReaction, setUserReaction] = useState(post.userReaction);
    const [reactionStats, setReactionStats] = useState(post.reactionStats || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content || '');
    const [saving, setSaving] = useState(false);
    const [displayContent, setDisplayContent] = useState(post.content);
    const menuRef = useRef(null);

    const reactionConfig = {
        like: { label: 'Thích', icon: '👍', color: 'text-blue-600' },
        love: { label: 'Yêu thích', icon: '❤️', color: 'text-red-500' },
        haha: { label: 'Haha', icon: '😆', color: 'text-yellow-500' },
        wow: { label: 'Wow', icon: '😮', color: 'text-yellow-500' },
        sad: { label: 'Buồn', icon: '😢', color: 'text-yellow-500' },
        angry: { label: 'Phẫn nộ', icon: '😡', color: 'text-orange-600' }
    };

    const handleReactionSelect = async (type) => {
        const previousReaction = userReaction;
        const isSame = previousReaction === type;
        
        // Optimistic update
        setUserReaction(isSame ? null : type);
        setIsLiked(!isSame);
        
        setReactionStats(prev => {
            const next = { ...prev };
            if (previousReaction) next[previousReaction]--;
            if (!isSame) next[type]++;
            return next;
        });
        
        setLikesCount(prev => {
            if (isSame) return prev - 1;
            if (!previousReaction) return prev + 1;
            return prev;
        });

        setShowReactions(false);

        try {
            const res = await api.post(`/posts/${post.id}/like`, { type });
            if (!res.data.success) {
                throw new Error();
            }
        } catch (error) {
            // Revert on error
            setUserReaction(previousReaction);
            setIsLiked(!!previousReaction);
            setReactionStats(post.reactionStats);
            setLikesCount(post.likesCount);
            toast.error('Có lỗi xảy ra khi thực hiện phản ứng');
        }
    };

    const handleMouseEnter = () => {
        const timeout = setTimeout(() => setShowReactions(true), 600);
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        // Delay hiding slightly to allow moving mouse to the picker
        setTimeout(() => {
            if (!document.querySelector('.reaction-picker:hover')) {
                setShowReactions(false);
            }
        }, 300);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/${post.id}/like`);
            if (res.data.success) {
                setIsLiked(!isLiked);
                setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error('Like error:', error);
            toast.error('Có lỗi xảy ra khi like bài viết');
        }
    };

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const res = await getPostComments(post.id);
            if (res.success) {
                setComments(res.data.comments);
            }
        } catch (error) {
            console.error('Fetch comments error:', error);
            toast.error('Không thể tải bình luận');
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const res = await createComment(post.id, commentText);
            if (res.success) {
                setComments(prev => [res.data.comment, ...prev]);
                setCommentText('');
                setCommentsCount(prev => prev + 1);
                toast.success('Đã gửi bình luận');
            }
        } catch (error) {
            console.error('Create comment error:', error);
            toast.error('Không thể gửi bình luận');
        }
    };

    const isVideo = (url) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
        return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.includes('/video/upload/');
    };

    const isOwner = user?.id === post.author.id;

    const handleDeletePost = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        setDeleting(true);
        try {
            const res = await api.delete(`/posts/${post.id}`);
            if (res.data.success) {
                toast.success('Đã xóa bài viết');
                if (onPostDeleted) onPostDeleted(post.id);
            }
        } catch (error) {
            console.error('Delete post error:', error);
            toast.error('Không thể xóa bài viết');
        } finally {
            setDeleting(false);
        }
    };

    const handleEditPost = async () => {
        if (!editContent.trim()) {
            toast.error('Nội dung không được để trống');
            return;
        }
        setSaving(true);
        try {
            const res = await api.put(`/posts/${post.id}`, { content: editContent });
            if (res.data.success) {
                setDisplayContent(editContent);
                setIsEditing(false);
                toast.success('Đã cập nhật bài viết');
                if (onPostUpdate) onPostUpdate();
            }
        } catch (error) {
            console.error('Edit post error:', error);
            toast.error('Không thể cập nhật bài viết');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none mb-4 border border-gray-100 dark:border-gray-700 transition-all duration-200 overflow-hidden font-segoe">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between relative">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                        {post.author.profilePicture ? (
                            <img
                                src={post.author.profilePicture}
                                alt={post.author.lastName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                                {post.author.firstName.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 hover:underline cursor-pointer flex items-center">
                            {post.author.firstName} {post.author.lastName}
                            {post.author.isVerified && <span className="text-blue-500 ml-1">✓</span>}
                            {(post.type === 'profile_update' || post.type === 'cover_update') && (
                                <span className="text-gray-500 font-normal ml-1">
                                    {post.content}
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {post.createdAt ? (
                                (() => {
                                    const date = new Date(post.createdAt);
                                    return isNaN(date.getTime())
                                        ? 'Vừa xong'
                                        : formatDistanceToNow(date, { addSuffix: true, locale: vi });
                                })()
                            ) : 'Vừa xong'}
                        </p>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 p-2 rounded-full transition-colors"
                    >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-10 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                                <BookmarkIcon className="h-5 w-5" />
                                <span>Lưu bài viết</span>
                            </button>

                            {isOwner && (
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setIsEditing(true);
                                        setEditContent(displayContent || '');
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                                >
                                    <PencilSquareIcon className="h-5 w-5" />
                                    <span>Chỉnh sửa bài viết</span>
                                </button>
                            )}

                            {!isOwner && (
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowReportModal(true);
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                                >
                                    <ExclamationTriangleIcon className="h-5 w-5" />
                                    <span>Báo cáo bài viết</span>
                                </button>
                            )}

                            {(isOwner || isAdmin) && (
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleDeletePost();
                                    }}
                                    disabled={deleting}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors disabled:opacity-50"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                    <span>{deleting ? 'Đang xóa...' : 'Xóa bài viết'}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Content */}
            {isEditing ? (
                <div className="px-4 pb-3">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
                        rows={3}
                        autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-2">
                        <button
                            onClick={handleEditPost}
                            disabled={saving}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button
                            onClick={() => { setIsEditing(false); setEditContent(displayContent || ''); }}
                            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            ) : (
                (post.type === 'normal' || post.type === 'share') && displayContent && (
                    <div className="px-4 pb-3">
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{displayContent}</p>
                    </div>
                )
            )}

            {/* Shared Post Preview */}
            {post.type === 'share' && post.sharedPost && (
                <div className="mx-4 mb-4 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/posts/${post.sharedPost.id}`}>
                    <div className="p-3 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800">
                        <img 
                            src={post.sharedPost.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.sharedPost.author?.firstName}+${post.sharedPost.author?.lastName}`} 
                            className="w-8 h-8 rounded-full"
                            alt="" 
                        />
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {post.sharedPost.author?.firstName} {post.sharedPost.author?.lastName}
                            </p>
                            <p className="text-[10px] text-gray-500">
                                {post.sharedPost.createdAt ? formatDistanceToNow(new Date(post.sharedPost.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}
                            </p>
                        </div>
                    </div>
                    {post.sharedPost.content && (
                        <p className="p-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                            {post.sharedPost.content}
                        </p>
                    )}
                    {(post.sharedPost.imageUrl || post.sharedPost.videoUrl) && (
                        <div className="bg-gray-50 flex justify-center border-t border-gray-100 dark:border-gray-800">
                            {(isVideo(post.sharedPost.imageUrl) || post.sharedPost.videoUrl) ? (
                                <div className="p-4 bg-black/10 w-full flex items-center justify-center aspect-video">
                                    <span className="text-4xl">▶️</span>
                                </div>
                            ) : (
                                <img src={post.sharedPost.imageUrl} className="w-full max-h-96 object-contain" alt="" />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Post Media (Image or Video) */}
            {(post.imageUrl || post.videoUrl) && (
                <div className={`bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-700 ${post.type === 'profile_update' ? 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800 py-4' : ''} flex justify-center`}>
                    {post.type === 'reel' || isVideo(post.imageUrl) || post.videoUrl ? (
                        <VideoPlayer
                            src={post.imageUrl || post.videoUrl}
                            className="w-full h-auto max-h-[600px]"
                            onViewTracked={() => {
                                // Track video view
                                api.post(`/posts/${post.id}/view`).catch(err => console.error('View tracking error:', err));
                            }}
                        />
                    ) : (
                        <img
                            src={post.imageUrl}
                            alt="Post content"
                            className={`w-full h-auto max-h-[600px] object-contain mx-auto shadow-sm cursor-pointer ${post.type === 'profile_update' ? 'rounded-full w-64 h-64 md:w-80 md:h-80 border-8 border-white shadow-xl object-cover' : ''
                                }`}
                            onClick={() => window.open(post.imageUrl, '_blank')}
                        />
                    )}
                </div>
            )}

            {/* Post Actions Stats */}
            <div className="px-4 py-2.5 flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center space-x-1">
                    {likesCount > 0 && (
                        <div className="flex items-center -space-x-1 mr-2">
                             {Object.entries(reactionStats)
                                .filter(([_, count]) => count > 0)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([type]) => (
                                    <span key={type} className="text-sm bg-white rounded-full p-0.5 border dark:border-gray-700">
                                        {reactionConfig[type]?.icon}
                                    </span>
                                ))
                             }
                             <span className="ml-2 pl-1 font-bold">{likesCount}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-3">
                    {commentsCount > 0 && (
                        <button onClick={toggleComments} className="hover:underline">
                            {commentsCount} bình luận
                        </button>
                    )}
                    {sharesCount > 0 && (
                        <span className="hover:underline cursor-pointer">
                            {sharesCount} lượt chia sẻ
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 border-t border-gray-100 dark:border-gray-700/50 mx-1">
                <div className="flex justify-between py-1 my-1">
                    <div 
                        className="relative flex-1"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {showReactions && (
                            <div className="reaction-picker absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-xl border dark:border-gray-700 p-1 flex items-center space-x-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                {Object.entries(reactionConfig).map(([type, config]) => (
                                    <button
                                        key={type}
                                        onClick={() => handleReactionSelect(type)}
                                        className="hover:scale-125 transition-transform duration-200 p-2 relative group"
                                        title={config.label}
                                    >
                                        <span className="text-2xl">{config.icon}</span>
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold pointer-events-none">
                                            {config.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => handleReactionSelect(userReaction || 'like')}
                            className={classNames(
                                "flex items-center space-x-2 px-3 py-2 rounded-xl w-full justify-center transition-all group",
                                isLiked ? (reactionConfig[userReaction]?.color || "text-blue-600 font-bold") : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            )}
                        >
                            <div className="group-hover:scale-110 transition-transform flex items-center space-x-2">
                                {isLiked && userReaction ? (
                                    <span className="text-xl">{reactionConfig[userReaction].icon}</span>
                                ) : (
                                    <HandThumbUpIcon className="h-5 w-5" />
                                )}
                                <span className="font-bold">{isLiked && userReaction ? reactionConfig[userReaction].label : 'Thích'}</span>
                            </div>
                        </button>
                    </div>
                    <button
                        onClick={toggleComments}
                        className={classNames(
                            "flex items-center space-x-2 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl flex-1 justify-center transition-all group",
                            showComments ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        )}
                    >
                        <ChatBubbleOvalLeftIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Bình luận</span>
                    </button>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-3 py-2 rounded-xl flex-1 justify-center transition-all group"
                    >
                        <ArrowUturnRightIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Chia sẻ</span>
                    </button>

                    <SavePostButton postId={post.id} className="flex-1 justify-center" />
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-xl border-t border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <div className="pt-4 flex space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.lastName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                                    {user?.firstName?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <form onSubmit={handleCommentSubmit} className="flex-1 relative">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Viết bình luận..."
                                className="w-full bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-2.5 pr-10 text-sm focus:outline-none focus:bg-gray-300 dark:focus:bg-gray-600 transition-all dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-400 p-1 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                        {loadingComments ? (
                            <div className="text-center py-2 text-gray-500 text-sm">Đang tải bình luận...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-2 text-gray-500 text-sm">Chưa có bình luận nào.</div>
                        ) : (
                            comments.map(comment => (
                                <Comment key={comment.id} comment={comment} />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <PostShareModal
                    post={post}
                    onClose={() => setShowShareModal(false)}
                    onShareSuccess={(newShare) => {
                        setSharesCount(prev => prev + 1);
                        if (onPostUpdate) onPostUpdate();
                    }}
                />
            )}

            {/* Report Modal */}
            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    targetType="post"
                    targetId={post.id}
                    targetName={`${post.author.firstName} ${post.author.lastName}`}
                />
            )}
        </div>
    );
};

export default Post;
