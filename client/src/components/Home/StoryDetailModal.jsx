import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const StoryDetailModal = ({ groupedStories, initialGroupIndex, onClose }) => {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
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

                {/* Footer Input Placeholder */}
                <div className="p-4 bg-gradient-to-t from-black/60 to-transparent pt-10">
                    <input
                        type="text"
                        placeholder="Trả lời..."
                        className="w-full bg-transparent border border-white/50 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white transition-all placeholder-white/70"
                    />
                </div>
            </div>
        </div>
    );
};

export default StoryDetailModal;
