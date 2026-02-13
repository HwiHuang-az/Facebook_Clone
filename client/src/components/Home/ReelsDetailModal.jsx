import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import VideoPlayer from '../Video/VideoPlayer';
import VideoShareModal from '../Video/VideoShareModal';
import SavePostButton from '../Post/SavePostButton';


const ReelsDetailModal = ({ reels, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const { user } = useAuth();
    const [showShareModal, setShowShareModal] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const currentReel = reels[currentIndex];

    const [isLiked, setIsLiked] = useState(currentReel?.isLiked || false);
    const [likesCount, setLikesCount] = useState(currentReel?.likesCount || 0);

    useEffect(() => {
        if (currentReel) {
            setIsLiked(currentReel.isLiked);
            setLikesCount(currentReel.likesCount);
        }
    }, [currentIndex, currentReel]);

    const handleNext = () => {
        if (currentIndex < reels.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/${currentReel.id}/like`);
            if (res.data.success) {
                setIsLiked(!isLiked);
                setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'ArrowRight') {
            handleNext();
        } else if (e.key === 'ArrowLeft') {
            handlePrev();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, reels.length]);

    const handleVideoEnd = () => {
        // Auto-play next reel when current one ends
        if (currentIndex < reels.length - 1) {
            setTimeout(() => {
                handleNext();
            }, 500); // Small delay before next reel
        }
    };

    if (!currentReel) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-50 p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all shadow-xl"
            >
                <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {currentIndex > 0 && (
                <button
                    onClick={handlePrev}
                    className="absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 z-50 p-3 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all hidden md:block"
                >
                    <ChevronLeftIcon className="h-8 w-8" />
                </button>
            )}
            {currentIndex < reels.length - 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 z-50 p-3 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all hidden md:block"
                >
                    <ChevronRightIcon className="h-8 w-8" />
                </button>
            )}

            {/* Video Container */}
            <div className="relative h-full w-full max-w-[450px] aspect-[9/16] flex flex-col justify-center">
                <VideoPlayer
                    src={currentReel.imageUrl}
                    className="w-full h-full"
                    autoPlay={true}
                    onViewTracked={() => {
                        api.post(`/posts/${currentReel.id}/view`).catch(err => console.error('View tracking error:', err));
                    }}
                    onEnded={handleVideoEnd}
                />

                {/* Info Overlay (Bottom) */}
                <div className="absolute bottom-4 left-4 right-14 text-white z-10 pointer-events-none">
                    <div className="flex items-center space-x-3 mb-3 pointer-events-auto">
                        <img
                            src={currentReel.author?.profilePicture || `https://ui-avatars.com/api/?name=${currentReel.author?.firstName}+${currentReel.author?.lastName}`}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                            alt=""
                        />
                        <div>
                            <p className="font-bold text-sm drop-shadow-md">
                                {currentReel.author?.firstName} {currentReel.author?.lastName}
                            </p>
                            <p className="text-[10px] bg-blue-600 px-2 py-0.5 rounded inline-block font-bold">Follow</p>
                        </div>
                    </div>
                    <p className="text-sm line-clamp-2 drop-shadow-md pointer-events-auto">
                        {currentReel.content}
                    </p>
                </div>

                {/* Interaction Sidebar (Right) */}
                <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-6 z-10">
                    <button onClick={handleLike} className="flex flex-col items-center group">
                        <div className="p-3 bg-gray-800 bg-opacity-50 rounded-full group-hover:bg-opacity-70 transition-all shadow-xl">
                            {isLiked ? (
                                <HeartIconSolid className="h-6 w-6 text-red-500" />
                            ) : (
                                <HeartIcon className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{likesCount}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex flex-col items-center group"
                    >
                        <div className={classNames(
                            "p-3 rounded-full transition-all shadow-xl",
                            showComments ? "bg-blue-600" : "bg-gray-800 bg-opacity-50 group-hover:bg-opacity-70"
                        )}>
                            <ChatBubbleOvalLeftIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{currentReel.commentsCount || 0}</span>
                    </button>

                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex flex-col items-center group"
                    >
                        <div className="p-3 bg-gray-800 bg-opacity-50 rounded-full group-hover:bg-opacity-70 transition-all shadow-xl">
                            <PaperAirplaneIcon className="h-6 w-6 text-white -rotate-45" />
                        </div>
                        <span className="text-white text-xs font-bold mt-1 drop-shadow-md">Share</span>
                    </button>

                    <SavePostButton
                        postId={currentReel.id}
                        className="!bg-gray-800 !bg-opacity-50 !rounded-full !p-3 hover:!bg-opacity-70 !flex-col !space-x-0 group"
                    />


                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-lg animate-spin-slow">
                        <img
                            src={currentReel.author?.profilePicture || `https://ui-avatars.com/api/?name=${currentReel.author?.firstName}+${currentReel.author?.lastName}`}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                    </div>
                </div>

                {/* Comments Overlay */}
                {showComments && (
                    <div className="absolute right-16 bottom-20 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden animate-fade-in-right">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white">Bình luận</h3>
                            <button onClick={() => setShowComments(false)} className="text-gray-500 hover:text-gray-700">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                            {/* Simple comment list placeholder/integration would go here */}
                            <p className="text-xs text-center text-gray-500 py-10">Bình luận cho Reels đang được tải...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <VideoShareModal
                    video={currentReel}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
};

export default ReelsDetailModal;
