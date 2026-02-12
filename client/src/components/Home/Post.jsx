import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import Comment from './Comment';
import { getPostComments, createComment } from '../../services/commentService';
import { toast } from 'react-hot-toast';
import VideoPlayer from '../Video/VideoPlayer';
import {
    HandThumbUpIcon as HandThumbUpIconSolid
} from '@heroicons/react/24/solid';
import {
    HandThumbUpIcon,
    ChatBubbleOvalLeftIcon,
    ArrowUturnRightIcon,
    EllipsisHorizontalIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

const Post = ({ post, onPostUpdate }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount);
    const [loadingComments, setLoadingComments] = useState(false);

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
                setComments(prev => [res.data, ...prev]);
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

    return (
        <div className="bg-white rounded-lg shadow-facebook mb-4 transition-all duration-200">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
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
                        <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
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
                <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Post Content */}
            {post.type === 'normal' && post.content && (
                <div className="px-4 pb-3">
                    <p className="text-gray-900 whitespace-pre-wrap text-sm md:text-base">{post.content}</p>
                </div>
            )}

            {/* Post Media (Image or Video) */}
            {(post.imageUrl || post.videoUrl) && (
                <div className={`bg-gray-50 border-y border-gray-100 ${post.type === 'profile_update' ? 'bg-gradient-to-b from-gray-50 to-white py-4' : ''} flex justify-center`}>
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
            <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-sm">
                <div className="flex items-center space-x-1">
                    {likesCount > 0 && (
                        <>
                            <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                                <HandThumbUpIconSolid className="h-3 w-3 text-white" />
                            </div>
                            <span>{likesCount}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center space-x-3">
                    {commentsCount > 0 && (
                        <button onClick={toggleComments} className="hover:underline">
                            {commentsCount} bình luận
                        </button>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 border-t border-gray-100 mx-1">
                <div className="flex justify-between py-1">
                    <button
                        onClick={handleLike}
                        className={classNames(
                            "flex items-center space-x-2 px-3 py-2 rounded-lg flex-1 justify-center transition-colors",
                            isLiked ? "text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        {isLiked ? (
                            <HandThumbUpIconSolid className="h-5 w-5" />
                        ) : (
                            <HandThumbUpIcon className="h-5 w-5" />
                        )}
                        <span>Thích</span>
                    </button>
                    <button
                        onClick={toggleComments}
                        className={classNames(
                            "flex items-center space-x-2 text-gray-600 px-3 py-2 rounded-lg flex-1 justify-center transition-colors",
                            showComments ? "bg-gray-100" : "hover:bg-gray-100"
                        )}
                    >
                        <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                        <span>Bình luận</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center transition-colors">
                        <ArrowUturnRightIcon className="h-5 w-5" />
                        <span>Chia sẻ</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 pb-4 bg-gray-50 rounded-b-lg border-t border-gray-100 transition-all duration-300">
                    <div className="pt-3 flex space-x-2 mb-4">
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
                                className="w-full bg-gray-200 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:bg-gray-300 transition-colors"
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
        </div>
    );
};

export default Post;
