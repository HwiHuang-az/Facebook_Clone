import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const StoryDetailModal = ({ groupedStories, initialGroupIndex, onClose }) => {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [viewers, setViewers] = useState([]);
    const [loadingViewers, setLoadingViewers] = useState(false);
    const [showViewersList, setShowViewersList] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const { user } = useAuth();

    const currentGroup = groupedStories[currentGroupIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];

    const handleNext = useCallback(() => {
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
        } else if (currentGroupIndex < groupedStories.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentStoryIndex, currentGroupIndex, groupedStories.length, currentGroup?.stories.length, onClose]);

    const handlePrev = useCallback(() => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentStoryIndex(groupedStories[currentGroupIndex - 1].stories.length - 1);
            setProgress(0);
        }
    }, [currentStoryIndex, currentGroupIndex]);

    useEffect(() => {
        if (!currentStory) return;

        // Mark story as viewed
        api.post(`/stories/${currentStory.id}/view`).catch(err => console.error('View story error:', err));

        // Reset viewers when story changes
        setViewers([]);
        setShowViewersList(false);

        const duration = 5000; // 5 seconds per story
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    handleNext();
                    return 100;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentStory, handleNext]);

    const fetchViewers = async () => {
        if (!currentStory || currentGroup.user.id !== user.id) return;
        
        try {
            setLoadingViewers(true);
            const res = await api.get(`/stories/${currentStory.id}/viewers`);
            if (res.data.success) {
                setViewers(res.data.data);
            }
        } catch (error) {
            console.error('Fetch story viewers error:', error);
        } finally {
            setLoadingViewers(false);
        }
    };

    const toggleViewersList = () => {
        if (!showViewersList) {
            fetchViewers();
        }
        setShowViewersList(!showViewersList);
    };

    const handleReply = async (e) => {
        if (e.key !== 'Enter' || !replyText.trim() || sendingReply) return;

        try {
            setSendingReply(true);
            const res = await api.post('/messages', {
                receiverId: currentGroup.user.id,
                content: `[Phản hồi tin] ${replyText.trim()}`
            });
            if (res.data.success) {
                toast.success('Đã gửi phản hồi');
                setReplyText('');
            }
        } catch (error) {
            console.error('Reply story error:', error);
            // Non-critical if it fails, but nice to notify
        } finally {
            setSendingReply(false);
        }
    };

    if (!currentGroup || !currentStory) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none">
            {/* Background Blur */}
            <div
                className="absolute inset-0 opacity-50 blur-3xl scale-110"
                style={{
                    backgroundImage: `url(${currentStory.imageUrl || 'https://via.placeholder.com/800'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[110] p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
                <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Navigation Buttons (Desktop) */}
            {currentGroupIndex > 0 || currentStoryIndex > 0 ? (
                <button
                    onClick={handlePrev}
                    className="absolute left-10 top-1/2 -translate-y-1/2 z-[110] p-3 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 hidden md:block"
                >
                    <ChevronLeftIcon className="h-8 w-8" />
                </button>
            ) : null}

            <button
                onClick={handleNext}
                className="absolute right-10 top-1/2 -translate-y-1/2 z-[110] p-3 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 hidden md:block"
            >
                <ChevronRightIcon className="h-8 w-8" />
            </button>

            {/* Story Container */}
            <div className="relative w-full max-w-[420px] aspect-[9/16] bg-gray-900 shadow-2xl overflow-hidden rounded-xl md:rounded-none lg:rounded-xl group flex flex-col">

                {/* Progress Bars */}
                <div className="absolute top-2 left-2 right-2 flex space-x-1 z-50">
                    {currentGroup.stories.map((s, idx) => (
                        <div key={s.id} className="h-0.5 flex-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-75 ease-linear"
                                style={{
                                    width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header (User Info) */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 text-white">
                    <div className="flex items-center space-x-3">
                        <img
                            src={currentGroup.user.profilePicture || `https://ui-avatars.com/api/?name=${currentGroup.user.firstName}+${currentGroup.user.lastName}`}
                            className="w-8 h-8 rounded-full border border-white"
                            alt=""
                        />
                        <div>
                            <p className="text-sm font-bold shadow-sm">{currentGroup.user.firstName} {currentGroup.user.lastName}</p>
                            <p className="text-[10px] opacity-80 shadow-sm">
                                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 relative flex items-center justify-center">
                    {currentStory.imageUrl ? (
                        <img
                            src={currentStory.imageUrl}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center p-8 text-center text-3xl font-bold text-white px-10"
                            style={{ background: currentStory.backgroundColor || 'linear-gradient(to bottom right, #ff0080, #7928ca)' }}
                        >
                            {currentStory.content}
                        </div>
                    )}

                    {/* Interaction Regions (Mobile Style) */}
                    <div className="absolute inset-0 flex">
                        <div onClick={handlePrev} className="w-1/3 h-full cursor-pointer" />
                        <div onClick={handleNext} className="w-2/3 h-full cursor-pointer" />
                    </div>
                </div>

                {/* Text overlay on image stories */}
                {currentStory.imageUrl && currentStory.content && (
                    <div className="absolute bottom-20 left-0 right-0 p-6 text-center text-white text-xl font-bold drop-shadow-xl pointer-events-none">
                        {currentStory.content}
                    </div>
                )}

                {/* Footer / Input Placeholder or Viewers */}
                <div className="p-4 bg-gradient-to-t from-black/60 to-transparent pt-10">
                    {currentGroup.user.id === user.id ? (
                        <div className="relative">
                            <button
                                onClick={toggleViewersList}
                                className="flex items-center space-x-2 text-white text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all"
                            >
                                <EyeIcon className="h-5 w-5" />
                                <span>{viewers.length || currentStory.viewsCount || 0} Người xem</span>
                            </button>

                            {showViewersList && (
                                <div className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-h-[300px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold dark:text-white">Người xem</h4>
                                        <button onClick={() => setShowViewersList(false)}>
                                            <XMarkIcon className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                                        {loadingViewers ? (
                                            <div className="flex justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : viewers.length === 0 ? (
                                            <p className="text-center text-sm text-gray-500 py-4 italic font-segoe">Chưa có người xem nào</p>
                                        ) : (
                                            viewers.map((viewer) => (
                                                <div key={viewer.id} className="flex items-center space-x-3">
                                                    <img 
                                                        src={viewer.viewer?.profilePicture || `https://ui-avatars.com/api/?name=${viewer.viewer?.firstName}+${viewer.viewer?.lastName}`} 
                                                        className="w-10 h-10 rounded-full object-cover" 
                                                        alt="" 
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold dark:text-white truncate">
                                                            {viewer.viewer?.firstName} {viewer.viewer?.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative group/reply text-white">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={handleReply}
                                disabled={sendingReply}
                                placeholder={sendingReply ? 'Đang gửi...' : 'Trả lời...'}
                                className="w-full bg-white/10 border border-white/30 rounded-full px-5 py-2.5 text-white text-sm focus:outline-none focus:border-white focus:bg-white/20 transition-all placeholder-white/60 backdrop-blur-md"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-white/50 group-focus-within/reply:text-white transition-colors">
                                <span className="text-[10px] font-bold border border-current px-1 rounded uppercase tracking-tighter opacity-70">Enter</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryDetailModal;
