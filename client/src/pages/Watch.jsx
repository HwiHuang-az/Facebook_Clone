import React, { useState, useEffect, useCallback } from 'react';
import Post from '../components/Home/Post';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import WatchSidebar from '../components/Watch/WatchSidebar';

const Watch = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('home'); // home, live, reels, saved
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.activeSection) {
            setActiveSection(location.state.activeSection);
        }
    }, [location.state]);

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/posts`, {
                params: {
                    limit: 20,
                    query: searchQuery,
                    type: activeSection === 'reels' ? 'reel' : undefined
                }
            });
            if (res.data.success) {
                // Filter posts that have either type='reel' or have image/video content that we want to show as video
                // For simplicity, showing all posts that are reels or just all posts to mock a feed
                const videoPosts = res.data.data.posts.filter(p => p.type === 'reel' || p.videoUrl || (p.imageUrl && p.type === 'normal'));
                setPosts(videoPosts);
            }
        } catch (error) {
            console.error('Fetch videos error:', error);
            toast.error('Không thể tải video');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos, searchQuery, activeSection]);

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
            {/* Sidebar */}
            <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
                <WatchSidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                <div className="max-w-2xl mx-auto space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-facebook m-6 border border-gray-100 dark:border-gray-700">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-facebook-600"></div>
                            <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold text-lg">Đang tải video của bạn...</p>
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook p-20 m-6 text-center flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 transition-all duration-200">
                            <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <span className="text-5xl">🎬</span>
                            </div>
                            <h3 className="text-2xl font-bold dark:text-white mb-2 tracking-tight">Không có video nào để hiển thị</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">Hãy thử theo dõi thêm bạn bè hoặc khám phá các nội dung mới để xem video của họ ở đây.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Watch;
