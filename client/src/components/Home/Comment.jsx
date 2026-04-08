import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReportModal from '../Shared/ReportModal';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Comment = ({ comment, onReplyAdded, onCommentCreated }) => {
    const { user } = useAuth();
    const [showReportModal, setShowReportModal] = useState(false);
    
    // Interactions State
    const [isLiked, setIsLiked] = useState(comment?.isLiked || false);
    const [likesCount, setLikesCount] = useState(comment?.likesCount || 0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replies, setReplies] = useState(comment?.replies || []);

    const isOwner = user?.id === comment?.author?.id;

    const handleLike = async () => {
        try {
            // Optimistic update
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

            await api.post(`/comments/${comment.id}/like`);
        } catch (error) {
            // Revert on error
            setIsLiked(isLiked);
            setLikesCount(likesCount);
            console.error('Error liking comment:', error);
            toast.error('Không thể thích bình luận');
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await api.post('/comments', {
                postId: comment.postId,
                content: replyContent,
                parentCommentId: comment.parentCommentId ? comment.parentCommentId : comment.id // Support nested replies up to 1 level
            });

            if (response.data.success) {
                // Determine where to add the reply based on whether we are a root comment
                if (!comment.parentCommentId) {
                    setReplies([...replies, response.data.data.comment]);
                } else if (onReplyAdded) {
                    onReplyAdded(response.data.data.comment);
                }
                
                setReplyContent('');
                setShowReplyInput(false);
                toast.success('Đã gửi phản hồi');
                if (onCommentCreated) onCommentCreated();
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi gửi phản hồi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewReply = (newReply) => {
        if (!comment.parentCommentId) {
            setReplies([...replies, newReply]);
        }
    };

    return (
        <div className="flex space-x-2 relative group mt-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 mt-1">
                {comment?.author?.profilePicture ? (
                    <img
                        src={comment.author.profilePicture}
                        alt={comment.author.lastName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                        {comment?.author?.firstName?.charAt(0)}
                    </span>
                )}
            </div>
            <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl px-3 py-2 inline-block max-w-full border dark:border-gray-700 relative">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white hover:underline cursor-pointer">
                        {comment?.author?.firstName} {comment?.author?.lastName}
                    </h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap">
                        {comment?.content}
                    </p>
                    
                    {/* Likes Counter Icon */}
                    {likesCount > 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full px-1.5 py-0.5 shadow flex items-center space-x-1 border dark:border-gray-700 text-[10px] text-gray-500">
                            <span className="text-blue-500">👍</span>
                            <span>{likesCount}</span>
                        </div>
                    )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-3 mt-1 ml-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <button 
                        onClick={handleLike} 
                        className={`hover:underline ${isLiked ? 'text-blue-600 dark:text-blue-400' : ''}`}
                    >
                        Thích
                    </button>
                    <button 
                        onClick={() => setShowReplyInput(!showReplyInput)} 
                        className="hover:underline"
                    >
                        Trả lời
                    </button>
                    {!isOwner && (
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="hover:underline"
                        >
                            Báo cáo
                        </button>
                    )}
                    <span className="font-normal text-[11px]">
                        {comment?.createdAt ? (
                            (() => {
                                const date = new Date(comment.createdAt);
                                return isNaN(date.getTime())
                                    ? 'Vừa xong'
                                    : formatDistanceToNow(date, { addSuffix: true, locale: vi });
                            })()
                        ) : 'Vừa xong'}
                    </span>
                </div>

                {/* Reply Input Field */}
                {showReplyInput && (
                    <div className="mt-2 flex space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 mt-1">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt="You"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                                    {user?.firstName?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <form onSubmit={handleReplySubmit} className="flex-1">
                            <input
                                type="text"
                                className="w-full bg-gray-100 dark:bg-gray-700 text-sm rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                                placeholder={`Phản hồi ${comment?.author?.lastName}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </form>
                    </div>
                )}

                {/* Nested Replies */}
                {replies?.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {replies.map(reply => (
                            <Comment 
                                key={reply.id} 
                                comment={reply} 
                                onReplyAdded={handleNewReply}
                                onCommentCreated={onCommentCreated}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    targetType="comment"
                    targetId={comment?.id}
                    targetName={`${comment?.author?.firstName} ${comment?.author?.lastName}`}
                />
            )}
        </div>
    );
};

export default Comment;
