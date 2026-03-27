import React, { useState, useEffect } from 'react';
import { BookmarkIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Post from '../components/Home/Post';
import { toast } from 'react-hot-toast';
import SavedSidebar from '../components/Saved/SavedSidebar';
import CreateCollectionModal from '../components/Saved/CreateCollectionModal';

const SavedPostsPage = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.selectedCollection) {
            setSelectedCollection(location.state.selectedCollection);
        }
        if (location.state?.searchTerm) {
            setSearchTerm(location.state.searchTerm);
        }
    }, [location.state]);

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/saved-posts', {
                params: {
                    collection: selectedCollection === 'Tất cả' ? null : selectedCollection
                }
            });
            if (res.data.success) {
                setSavedPosts(res.data.data);
            }
        } catch (error) {
            console.error('Fetch saved items error:', error);
            toast.error('Không thể tải mục đã lưu');
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
            console.error('Fetch collections error:', error);
        }
    };

    useEffect(() => {
        fetchSavedPosts();
    }, [selectedCollection]);

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleUnsave = async (savedId) => {
        try {
            const res = await api.delete(`/saved-posts/${savedId}`);
            if (res.data.success) {
                setSavedPosts(prev => prev.filter(p => p.id !== savedId));
                fetchCollections();
                toast.success('Đã gỡ mục đã lưu');
            }
        } catch (error) {
            toast.error('Không thể gỡ mục đã lưu');
        }
    };

    const filteredPosts = savedPosts.filter(item => {
        if (!searchTerm) return true;
        const content = item.post?.content?.toLowerCase() || '';
        return content.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
            {/* Sidebar */}
            <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
                <SavedSidebar
                    collections={collections}
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onShowCreateCollection={() => setIsCreateModalOpen(true)}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Toolbar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-facebook mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100 dark:border-gray-700 transition-all duration-200">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm trong mục đã lưu"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-facebook-600/50 outline-none text-[15px] font-medium transition-all dark:text-white dark:placeholder-gray-400"
                            />
                        </div>

                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl self-end md:self-auto shadow-inner">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-md text-facebook-600 dark:text-facebook-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'}`}
                            >
                                <ListBulletIcon className="h-5 w-5 stroke-2" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-md text-facebook-600 dark:text-facebook-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'}`}
                            >
                                <Squares2X2Icon className="h-5 w-5 stroke-2" />
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                            {filteredPosts.map((item) => (
                                <div key={item.id} className="relative group">
                                    <Post post={item.post} onPostUpdate={fetchSavedPosts} />
                                    <button
                                        onClick={() => handleUnsave(item.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 z-10"
                                        title="Gỡ khỏi mục đã lưu"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook p-16 text-center border border-gray-100 dark:border-gray-700 transition-all duration-200">
                            <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <BookmarkIcon className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold dark:text-white mb-2">Chưa có mục nào</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Những bài viết bạn đã lưu sẽ xuất hiện ở đây.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateCollectionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchCollections}
            />
        </div>
    );
};

export default SavedPostsPage;
