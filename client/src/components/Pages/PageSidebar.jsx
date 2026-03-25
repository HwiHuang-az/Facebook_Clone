import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import {
    FlagIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    HandThumbUpIcon,
    PresentationChartLineIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const PageSidebar = ({ activeTab, onTabChange, onCreatePage, searchQuery, onSearchChange }) => {
    const [likedPages, setLikedPages] = useState([]);
    const [localSearch, setLocalSearch] = useState(searchQuery || '');
    const location = useLocation();

    useEffect(() => {
        const fetchLikedPages = async () => {
            try {
                const res = await api.get('/pages/liked', { params: { query: searchQuery } });
                if (res.data.success) {
                    setLikedPages(res.data.data);
                }
            } catch (error) {
                console.error('Fetch liked pages error:', error);
            }
        };
        fetchLikedPages();
    }, [searchQuery]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearchChange) onSearchChange(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    const isActive = (tab) => activeTab === tab;

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 shadow-sm h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col pt-4 font-segoe text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Trang</h1>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Cog6ToothIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm trang"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="space-y-1 mb-6">
                <Link
                    to="/pages"
                    onClick={() => onTabChange?.('discover')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('discover') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <div className={`p-2 rounded-full ${isActive('discover') ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <FlagIcon className="h-5 w-5" />
                    </div>
                    <span>Khám phá</span>
                </Link>

                <Link
                    to="/pages"
                    onClick={() => onTabChange?.('likes')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('likes') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <div className={`p-2 rounded-full ${isActive('likes') ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <HandThumbUpIcon className="h-5 w-5" />
                    </div>
                    <span>Trang đã thích</span>
                </Link>

                <Link
                    to="/pages"
                    onClick={() => onTabChange?.('yours')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('yours') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <div className={`p-2 rounded-full ${isActive('yours') ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <PresentationChartLineIcon className="h-5 w-5" />
                    </div>
                    <span>Trang của bạn</span>
                </Link>

                <button
                    onClick={() => onCreatePage?.()}
                    className="w-full flex items-center justify-center space-x-2 mt-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Tạo trang mới</span>
                </button>
            </div>

            {/* Liked Pages List */}
            <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="font-bold text-gray-900 dark:text-white">Trang bạn đã thích</h2>
                    <button
                        onClick={() => onTabChange?.('likes')}
                        className="text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded"
                    >
                        Xem tất cả
                    </button>
                </div>

                <div className="space-y-1">
                    {likedPages.length > 0 ? (
                        likedPages.slice(0, 8).map((page) => (
                            <Link
                                to={`/pages/${page.id}`}
                                key={page.id}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group"
                            >
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                    {page.profilePicture ? (
                                        <img src={page.profilePicture} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <FlagIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{page.name}</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium">Lượt thích: {page.likesCount || 0}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-4">Chưa thích trang nào</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageSidebar;
