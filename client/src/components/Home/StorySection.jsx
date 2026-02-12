import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import CreateStoryModal from '../Profile/CreateStoryModal';

const StorySection = () => {
    const [stories, setStories] = useState([]);
    const [groupedStories, setGroupedStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                    {/* Create Story Button */}
                    {activeTab === 'stories' && (
                        <div
                            onClick={() => setIsModalOpen(true)}
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
                                <span className="text-[11px] font-bold text-gray-900">Tạo tin</span>
                            </div>
                        </div>
                    )}

                    {/* Real Stories */}
                    {activeTab === 'stories' && (
                        loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="w-28 h-48 bg-gray-200 animate-pulse rounded-xl flex-shrink-0"></div>
                            ))
                        ) : (
                            groupedStories.map((group) => (
                                <div
                                    key={group.user.id}
                                    className="relative w-28 h-48 rounded-xl overflow-hidden cursor-pointer group shadow-sm flex-shrink-0"
                                >
                                    <img
                                        src={group.stories[0].imageUrl || `https://via.placeholder.com/150/000000/FFFFFF?text=${encodeURIComponent(group.stories[0].content || 'Story')}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        alt="Story"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all"></div>

                                    {/* User Profile */}
                                    <div className="absolute top-2 left-2 w-10 h-10 rounded-full border-4 border-blue-600 overflow-hidden shadow-lg z-10 bg-white">
                                        <img
                                            src={group.user.profilePicture || `https://ui-avatars.com/api/?name=${group.user.firstName}+${group.user.lastName}`}
                                            alt={group.user.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* User Name */}
                                    <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-bold drop-shadow-md truncate">
                                        {group.user.firstName} {group.user.lastName}
                                    </div>
                                </div>
                            ))
                        )
                    )}

                    {/* Reels Placeholder */}
                    {activeTab === 'reels' && (
                        <div className="flex flex-col items-center justify-center w-full py-10 text-gray-500 italic">
                            Chưa có thước phim nào.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateStoryModal
                    onClose={() => setIsModalOpen(false)}
                    onCreated={() => {
                        fetchStories();
                    }}
                />
            )}
        </div>
    );
};

export default StorySection;
