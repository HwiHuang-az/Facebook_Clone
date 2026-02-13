import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import CreateStoryModal from '../Profile/CreateStoryModal';
import CreateReelModal from '../Profile/CreateReelModal';
import ReelsDetailModal from './ReelsDetailModal';
import StoryDetailModal from './StoryDetailModal';


const StorySection = () => {
    const [stories, setStories] = useState([]);
    const [reels, setReels] = useState([]);
    const [groupedStories, setGroupedStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reelsLoading, setReelsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [selectedReelIndex, setSelectedReelIndex] = useState(null);
    const [selectedUserIndex, setSelectedUserIndex] = useState(null);
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('stories'); // 'stories' or 'reels'

    const fetchStories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/stories');
            if (res.data.success) {
                setStories(res.data.data);
                groupStories(res.data.data);
            }
        } catch (error) {
            console.error('Fetch stories error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReels = async () => {
        try {
            setReelsLoading(true);
            const res = await api.get('/posts?type=reel&limit=10');
            if (res.data.success) {
                setReels(res.data.data.posts);
            }
        } catch (error) {
            console.error('Fetch reels error:', error);
        } finally {
            setReelsLoading(false);
        }
    };

    const groupStories = (storyList) => {
        // Group stories by userId
        const groups = storyList.reduce((acc, story) => {
            const userId = story.author?.id;
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.author,
                    stories: []
                };
            }
            acc[userId].stories.push(story);
            return acc;
        }, {});
        setGroupedStories(Object.values(groups));
    };

    useEffect(() => {
        fetchStories();
        fetchReels();
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-facebook mb-4 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('stories')}
                    className={`flex-1 py-3 font-semibold text-sm md:text-base flex items-center justify-center space-x-2 transition-colors ${activeTab === 'stories' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <span>📖</span>
                    <span>Tin</span>
                </button>
                <button
                    onClick={() => setActiveTab('reels')}
                    className={`flex-1 py-3 font-semibold text-sm md:text-base flex items-center justify-center space-x-2 transition-colors ${activeTab === 'reels' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <span>🎬</span>
                    <span>Reels</span>
                </button>
            </div>

            <div className="p-4 overflow-x-auto no-scrollbar">
                <div className="flex space-x-2 min-w-max pb-2">
                    {/* Create Button */}
                    <div
                        onClick={() => activeTab === 'stories' ? setIsModalOpen(true) : setIsReelModalOpen(true)}
                        className="relative w-28 h-48 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group shadow-sm flex-shrink-0"
                    >
                        <div className="h-3/4 overflow-hidden">
                            <img
                                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                alt="My profile"
                            />
                        </div>
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white text-xl">
                            +
                        </div>
                        <div className="h-1/4 flex items-end justify-center pb-2 bg-white">
                            <span className="text-[11px] font-bold text-gray-900">
                                {activeTab === 'stories' ? 'Tạo tin' : 'Tạo reel'}
                            </span>
                        </div>
                    </div>

                    {/* Stories */}
                    {activeTab === 'stories' && (
                        loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="w-28 h-48 bg-gray-200 animate-pulse rounded-xl flex-shrink-0"></div>
                            ))
                        ) : (
                            groupedStories.map((group, index) => (
                                <div
                                    key={group.user.id}
                                    onClick={() => setSelectedUserIndex(index)}
                                    className="relative w-28 h-48 rounded-xl overflow-hidden cursor-pointer group shadow-sm flex-shrink-0"
                                >
                                    <img
                                        src={group.stories[0].imageUrl || `https://via.placeholder.com/150/000000/FFFFFF?text=${encodeURIComponent(group.stories[0].content || 'Story')}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        alt="Story"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all"></div>
                                    <div className="absolute top-2 left-2 w-10 h-10 rounded-full border-4 border-blue-600 overflow-hidden shadow-lg z-10 bg-white">
                                        <img
                                            src={group.user.profilePicture || `https://ui-avatars.com/api/?name=${group.user.firstName}+${group.user.lastName}`}
                                            alt={group.user.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-bold drop-shadow-md truncate">
                                        {group.user.firstName} {group.user.lastName}
                                    </div>
                                </div>
                            ))
                        )
                    )}

                    {/* Reels */}
                    {activeTab === 'reels' && (
                        reelsLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="w-28 h-48 bg-gray-200 animate-pulse rounded-xl flex-shrink-0"></div>
                            ))
                        ) : reels.length > 0 ? (
                            reels.map((reel, index) => (
                                <div
                                    key={reel.id}
                                    onClick={() => setSelectedReelIndex(index)}
                                    className="relative w-28 h-48 rounded-xl overflow-hidden cursor-pointer group shadow-sm flex-shrink-0 bg-black"
                                >
                                    <video
                                        src={reel.imageUrl}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <div className="border-l-6 border-l-white border-y-6 border-y-transparent ml-1"></div>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-lg z-10 bg-white">
                                        <img
                                            src={reel.author?.profilePicture || `https://ui-avatars.com/api/?name=${reel.author?.firstName}+${reel.author?.lastName}`}
                                            alt={reel.author?.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold drop-shadow-md truncate">
                                        {reel.author?.firstName} {reel.author?.lastName}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center px-10 text-gray-500 italic text-sm">
                                Chưa có thước phim nào
                            </div>
                        )
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateStoryModal
                    onClose={() => setIsModalOpen(false)}
                    onCreated={fetchStories}
                />
            )}

            {isReelModalOpen && (
                <CreateReelModal
                    isOpen={isReelModalOpen}
                    onClose={() => setIsReelModalOpen(false)}
                    onReelCreated={fetchReels}
                />
            )}

            {selectedReelIndex !== null && (
                <ReelsDetailModal
                    reels={reels}
                    initialIndex={selectedReelIndex}
                    onClose={() => setSelectedReelIndex(null)}
                />
            )}

            {selectedUserIndex !== null && (
                <StoryDetailModal
                    groupedStories={groupedStories}
                    initialGroupIndex={selectedUserIndex}
                    onClose={() => setSelectedUserIndex(null)}
                />
            )}
        </div>
    );
};

export default StorySection;
