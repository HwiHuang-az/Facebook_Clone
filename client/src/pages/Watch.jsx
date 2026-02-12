import React, { useState, useEffect, useCallback } from 'react';
import Post from '../components/Home/Post';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { TvIcon, VideoCameraIcon, BookmarkIcon } from '@heroicons/react/24/outline';

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
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-white shadow-sm h-auto lg:h-[calc(100vh-56px)] lg:sticky lg:top-14 overflow-y-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Video</h1>

                <div className="space-y-1">
                    {[
                        { id: 'home', label: 'Trang chủ', icon: TvIcon },
                        { id: 'live', label: 'Trực tiếp', icon: VideoCameraIcon },
                        { id: 'reels', label: 'Reels', icon: VideoCameraIcon },
                        { id: 'saved', label: 'Video đã lưu', icon: BookmarkIcon },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${activeSection === item.id ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${activeSection === item.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 overflow-y-auto">
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
