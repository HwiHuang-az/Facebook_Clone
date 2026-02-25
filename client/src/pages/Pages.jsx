import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    FlagIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    HeartIcon,
    HandThumbUpIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';

import PageSidebar from '../components/Pages/PageSidebar';
import CreatePageModal from '../components/Pages/CreatePageModal';

const Pages = () => {
    const [pages, setPages] = useState([]);
    const [myPages, setMyPages] = useState([]);
    const [likedPages, setLikedPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('discover');
    const [likingPages, setLikingPages] = useState(new Set());

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [discoverRes, myRes, likedRes] = await Promise.all([
                api.get('/pages', { params: { query: searchQuery } }),
                api.get('/pages/my'),
                api.get('/pages/liked')
            ]);

            if (discoverRes.data.success) setPages(discoverRes.data.data);
            if (myRes.data.success) setMyPages(myRes.data.data);
            if (likedRes.data.success) setLikedPages(likedRes.data.data);
        } catch (error) {
            console.error('Fetch pages error:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleLike = async (e, pageId) => {
        e.preventDefault();
        e.stopPropagation();
        if (likingPages.has(pageId)) return;

        setLikingPages(prev => new Set(prev).add(pageId));
        try {
            const res = await api.post(`/pages/${pageId}/like`);
            if (res.data.success) {
                // Refresh data to get updated counts and liked state
                fetchData();
                toast.success(res.data.isLiked ? 'Đã thích trang' : 'Đã bỏ thích trang');
            }
        } catch (error) {
            console.error('Toggle like error:', error);
            toast.error('Không thể thực hiện');
        } finally {
            setLikingPages(prev => {
                const next = new Set(prev);
                next.delete(pageId);
                return next;
            });
        }
    };

    const isPageLiked = (pageId) => {
        return likedPages.some(p => p.id === pageId);
    };

    const PageCard = ({ page, showLikeStatus = false }) => (
        <Link to={`/pages/${page.id}`} key={page.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 group">
            <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                {page.coverPhoto ? (
                    <img src={page.coverPhoto} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-30" />
                )}
                <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-xl border-4 border-white overflow-hidden bg-white shadow-md">
                    {page.profilePicture ? (
                        <img src={page.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                            <FlagIcon className="h-8 w-8" />
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 pt-8">
                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{page.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{page.category || 'Cộng đồng'} · {page.likesCount || 0} lượt thích</p>
                {isPageLiked(page.id) ? (
                    <button
                        onClick={(e) => handleToggleLike(e, page.id)}
                        disabled={likingPages.has(page.id)}
                        className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                        <HandThumbUpIconSolid className="h-5 w-5" />
                        <span>Đã thích</span>
                    </button>
                ) : (
                    <button
                        onClick={(e) => handleToggleLike(e, page.id)}
                        disabled={likingPages.has(page.id)}
                        className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <HandThumbUpIcon className="h-5 w-5" />
                        <span>Thích</span>
                    </button>
                )}
            </div>
        </Link>
    );

    const SkeletonCard = () => (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
            <div className="h-32 bg-gray-200" />
            <div className="p-4 pt-10">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-9 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden lg:block w-80 lg:sticky lg:top-0 h-[calc(100vh-56px)]">
                <PageSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onCreatePage={() => setShowCreateModal(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'discover' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Trang được đề xuất</h2>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : pages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pages.map(page => <PageCard key={page.id} page={page} />)}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-20 text-center border">
                                <FlagIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-lg font-bold text-gray-800">Không tìm thấy Trang nào</p>
                                <p className="text-gray-500 mt-2">Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'likes' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Trang đã thích</h2>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : likedPages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {likedPages.map(page => <PageCard key={page.id} page={page} showLikeStatus />)}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-20 text-center flex flex-col items-center justify-center border">
                                <HandThumbUpIcon className="h-20 w-20 text-gray-200 mb-4" />
                                <p className="text-xl font-bold text-gray-800">Bạn chưa thích Trang nào</p>
                                <p className="text-gray-500 mt-2">Khám phá các Trang để tìm thấy cộng đồng bạn yêu thích!</p>
                                <button
                                    onClick={() => setActiveTab('discover')}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Khám phá Trang
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'yours' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Trang của bạn</h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>Tạo Trang mới</span>
                            </button>
                        </div>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between animate-pulse">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                                            <div>
                                                <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                                                <div className="h-3 bg-gray-200 rounded w-48" />
                                            </div>
                                        </div>
                                        <div className="h-9 bg-gray-200 rounded-lg w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : myPages.length > 0 ? (
                            <div className="space-y-4">
                                {myPages.map((page) => (
                                    <Link to={`/pages/${page.id}`} key={page.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                                                {page.profilePicture ? (
                                                    <img src={page.profilePicture} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                                                        <FlagIcon className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{page.name}</h3>
                                                <p className="text-sm text-gray-500">{page.category || 'Cộng đồng'} · {page.likesCount || 0} lượt thích</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                                            Xem Trang
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-20 text-center flex flex-col items-center justify-center border">
                                <FlagIcon className="h-20 w-20 text-gray-200 mb-4" />
                                <p className="text-xl font-bold text-gray-800">Bạn chưa quản lý Trang nào</p>
                                <p className="text-gray-500 mt-2">Bắt đầu xây dựng cộng đồng của bạn ngay hôm nay!</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Tạo Trang mới
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreatePageModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(newPage) => {
                        fetchData();
                        setActiveTab('yours');
                    }}
                />
            )}
        </div>
    );
};

export default Pages;
