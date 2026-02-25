import React, { useState, useEffect, useCallback } from 'react';
import Post from '../components/Home/Post';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import WatchSidebar from '../components/Watch/WatchSidebar';

const Watch = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('home'); // home, live, reels, saved

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch posts and filter for videos/reels
            // In a more advanced implementation, we'd have a specific /videos endpoint
            const res = await api.get(`/posts?limit=20`);
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
    }, [fetchVideos]);

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
            {/* Sidebar */}
            <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
                <WatchSidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
                <div className="max-w-2xl mx-auto space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500 font-bold">Đang tải video...</p>
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-10 text-center flex flex-col items-center justify-center border">
                            <div className="text-5xl mb-4">🎬</div>
                            <p className="font-bold text-xl text-gray-800">Không có video nào để hiển thị</p>
                            <p className="text-gray-500 mt-2">Hãy thử theo dõi thêm bạn bè để xem video của họ.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Watch;
