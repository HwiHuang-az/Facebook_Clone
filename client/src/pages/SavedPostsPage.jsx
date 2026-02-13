import React, { useState, useEffect } from 'react';
import { BookmarkIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import Post from '../components/Home/Post';
import { toast } from 'react-hot-toast';

const SavedPostsPage = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        fetchSavedPosts();
        fetchCollections();
    }, [selectedCollection]);

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            const url = selectedCollection
                ? `/saved-posts?collection=${selectedCollection}`
                : '/saved-posts';
            const res = await api.get(url);
            if (res.data.success) {
                setSavedPosts(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            toast.error('Failed to load saved items');
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await api.get('/saved-posts/collections');
            if (res.data.success) {
                setCollections(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
            <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
                {/* Sidebar */}
                <div className="w-80 flex-shrink-0 hidden lg:block">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-24">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                                <BookmarkIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mục đã lưu</h1>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedCollection(null)}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${!selectedCollection ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <BookmarkIcon className="h-5 w-5" />
                                    <span>Tất cả</span>
                                </div>
                            </button>

                            {collections.map(coll => (
                                <button
                                    key={coll.collectionName}
                                    onClick={() => setSelectedCollection(coll.collectionName)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${selectedCollection === coll.collectionName ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-[10px]">
                                            {coll.collectionName.charAt(0)}
                                        </div>
                                        <span>{coll.collectionName}</span>
                                    </div>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{coll.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm trong mục đã lưu"
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <ListBulletIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <Squares2X2Icon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500">Đang tải các mục đã lưu...</p>
                        </div>
                    ) : savedPosts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm py-20 px-4 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookmarkIcon className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có mục nào được lưu</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Lưu bài viết để xem lại sau. Các mục bạn lưu sẽ xuất hiện ở đây.
                            </p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            {savedPosts.map(save => (
                                <Post
                                    key={save.id}
                                    post={save.post}
                                    onPostUpdate={fetchSavedPosts}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {savedPosts.map(save => (
                                <div key={save.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative">
                                        {save.post.imageUrl ? (
                                            <img src={save.post.imageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-4">
                                                <p className="text-sm text-gray-500 line-clamp-4">{save.post.content}</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => window.open(`/post/${save.post.id}`, '_blank')}
                                                className="bg-white text-gray-900 px-4 py-2 rounded-md font-semibold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                                            {save.post.author?.firstName} {save.post.author?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">Đã lưu vào: {save.collectionName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedPostsPage;
