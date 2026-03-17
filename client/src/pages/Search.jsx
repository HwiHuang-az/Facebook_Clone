import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    MagnifyingGlassIcon, 
    UserIcon, 
    UserGroupIcon, 
    FlagIcon, 
    NewspaperIcon,
    BuildingStorefrontIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [activeTab, setActiveTab] = useState('all');
    const [results, setResults] = useState({
        users: { rows: [] },
        posts: { rows: [] },
        groups: { rows: [] },
        pages: { rows: [] }
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchResults = useCallback(async () => {
        if (!query || query.length < 2) return;
        try {
            setLoading(true);
            const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
            if (res.data.success) {
                setResults(prev => ({
                    ...prev,
                    ...res.data.data
                }));
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Không thể tìm kiếm');
        } finally {
            setLoading(false);
        }
    }, [query, activeTab]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const tabs = [
        { id: 'all', label: 'Tất cả', icon: NewspaperIcon },
        { id: 'users', label: 'Mọi người', icon: UserIcon },
        { id: 'posts', label: 'Bài viết', icon: NewspaperIcon },
        { id: 'groups', label: 'Nhóm', icon: UserGroupIcon },
        { id: 'pages', label: 'Trang', icon: FlagIcon },
    ];

    const UserResult = ({ user }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center justify-between">
            <Link to={`/profile/${user.id}`} className="flex items-center space-x-3">
                <img src={user.profilePicture || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <p className="font-bold dark:text-white hover:underline">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">Người dùng</p>
                </div>
            </Link>
            <button className="px-4 py-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-200 transition">
                Thêm bạn bè
            </button>
        </div>
    );

    const PostResult = ({ post }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
                <img src={post.author?.profilePicture || 'https://via.placeholder.com/30'} alt="" className="w-8 h-8 rounded-full" />
                <div>
                    <p className="text-sm font-bold dark:text-white">{post.author?.firstName} {post.author?.lastName}</p>
                    <p className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
            <p className="text-sm dark:text-gray-200 line-clamp-3 mb-3">{post.content}</p>
            {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />
            )}
            <Link to={`/posts/${post.id}`} className="text-sm text-blue-600 hover:underline">Xem chi tiết bài viết</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Kết quả tìm kiếm cho "{query}"</h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 border-b dark:border-gray-700 pb-0.5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-t-lg'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {!loading && (
                <div className="space-y-6">
                    {/* Users Section */}
                    {(activeTab === 'all' || activeTab === 'users') && results.users?.rows?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold dark:text-white mb-3 flex items-center">
                                <UserIcon className="h-5 w-5 mr-2" /> Mọi người
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.users.rows.map(user => <UserResult key={user.id} user={user} />)}
                            </div>
                        </div>
                    )}

                    {/* Posts Section */}
                    {(activeTab === 'all' || activeTab === 'posts') && results.posts?.rows?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold dark:text-white mb-3 flex items-center">
                                <NewspaperIcon className="h-5 w-5 mr-2" /> Bài viết
                            </h2>
                            <div className="space-y-4">
                                {results.posts.rows.map(post => <PostResult key={post.id} post={post} />)}
                            </div>
                        </div>
                    )}

                    {/* Groups Section */}
                    {(activeTab === 'all' || activeTab === 'groups') && results.groups?.rows?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold dark:text-white mb-3 flex items-center">
                                <UserGroupIcon className="h-5 w-5 mr-2" /> Nhóm
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.groups.rows.map(group => (
                                    <div key={group.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <UserGroupIcon className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold dark:text-white">{group.name}</p>
                                            <p className="text-xs text-gray-500">Nhóm công khai</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && activeTab !== 'all' && results[activeTab]?.rows?.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                            <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Không tìm thấy kết quả phù hợp với tìm kiếm của bạn.</p>
                        </div>
                    )}

                    {!loading && activeTab === 'all' && 
                     results.users?.rows?.length === 0 && 
                     results.posts?.rows?.length === 0 && 
                     results.groups?.rows?.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                            <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Chúng tôi không tìm thấy kết quả cho "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
