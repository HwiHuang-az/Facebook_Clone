import React, { useState, useEffect } from 'react';
import { VideoCameraIcon } from '@heroicons/react/24/solid';
import api from '../../utils/api';
import CreateReelModal from './CreateReelModal';

const ProfileReels = ({ posts, isOwnProfile }) => {
    const [activeSubTab, setActiveSubTab] = useState('my_reels');
    const [isCreateReelModalOpen, setIsCreateReelModalOpen] = useState(false);
    const [savedReels, setSavedReels] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    // Filter "Reels". currently assuming type='reel' or normal posts with video?
    // Since I'm just adding type='reel' in CreateReelModal, I should filter by that.
    // Fallback: if no type 'reel', maybe show nothing or mock.
    // For now, let's assume we filter by p.type === 'reel' OR (p.type === 'normal' && p.videoUrl) if videoUrl exists? 
    // Actually CreatePostModal uploads to 'image'. Backend might handle it. 
    // Let's filter by p.type === 'reel'.

    const myReels = posts.filter(p => p.type === 'reel');
    // Mock saved reels for now as we don't have that data in 'posts' prop typically
    // const savedReels = []; // This line is replaced by state

    const fetchSavedReels = async () => {
        try {
            setLoadingSaved(true);
            const res = await api.get('/saved-posts');
            if (res.data.success) {
                // Filter saved posts that are reels
                // The backend response structure for saved posts might vary, assuming post is nested
                const savedItems = res.data.data.map(item => item.post || item);
                const reelsOnly = savedItems.filter(p => p && p.type === 'reel');
                setSavedReels(reelsOnly);
            }
        } catch (error) {
            console.error('Fetch saved reels error:', error);
        } finally {
            setLoadingSaved(false);
        }
    };

    useEffect(() => {
        if (activeSubTab === 'saved_reels') {
            fetchSavedReels();
        }
    }, [activeSubTab]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Reels</h2>
                {isOwnProfile && (
                    <button
                        onClick={() => setIsCreateReelModalOpen(true)}
                        className="text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center space-x-1"
                    >
                        <VideoCameraIcon className="h-5 w-5" />
                        <span>Thêm reel</span>
                    </button>
                )}
            </div>

            {/* Sub Tabs */}
            <div className="flex space-x-1 mb-6 border-b">
                <button
                    onClick={() => setActiveSubTab('my_reels')}
                    className={`px-4 py-3 font-semibold text-[15px] border-b-[3px] transition-colors ${activeSubTab === 'my_reels'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Reel của tôi
                </button>
                <button
                    onClick={() => setActiveSubTab('saved_reels')}
                    className={`px-4 py-3 font-semibold text-[15px] border-b-[3px] transition-colors ${activeSubTab === 'saved_reels'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Reel đã lưu
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px]">
                {activeSubTab === 'my_reels' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {myReels.length > 0 ? (
                            myReels.map((post) => (
                                <div key={post.id} className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer group">
                                    <video
                                        src={post.imageUrl} // Assuming uploaded file url is in imageUrl currently
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                            <div className="border-l-8 border-l-white border-y-8 border-y-transparent ml-1"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500 font-bold">
                                Không có Reel nào
                            </div>
                        )}
                    </div>
                )}

                {activeSubTab === 'saved_reels' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {loadingSaved ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="aspect-[9/16] bg-gray-200 animate-pulse rounded-lg"></div>
                            ))
                        ) : savedReels.length > 0 ? (
                            savedReels.map((reel) => (
                                <div key={reel.id} className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer group">
                                    <video
                                        src={reel.imageUrl}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500 font-bold">
                                Không có Reel đã lưu nào
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateReelModal
                isOpen={isCreateReelModalOpen}
                onClose={() => setIsCreateReelModalOpen(false)}
                onReelCreated={() => {
                    setIsCreateReelModalOpen(false);
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default ProfileReels;
