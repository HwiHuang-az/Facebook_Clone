import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    FlagIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    HeartIcon,
    HandThumbUpIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const Pages = () => {
    const [pages, setPages] = useState([]);
    const [myPages, setMyPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('discover'); // discover, yours, likes

    const fetchData = async () => {
        try {
            setLoading(true);
            const [discoverRes, myRes] = await Promise.all([
                api.get('/pages', { params: { query: searchQuery } }),
                api.get('/pages/my')
            ]);

            if (discoverRes.data.success) setPages(discoverRes.data.data);
            if (myRes.data.success) setMyPages(myRes.data.data);
        } catch (error) {
            console.error('Fetch pages error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchQuery]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-white shadow-sm h-auto lg:h-[calc(100vh-56px)] lg:sticky lg:top-14 overflow-y-auto p-4 border-r">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Trang</h1>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm Trang"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-0 focus:ring-0 focus:bg-white text-sm"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="space-y-1">
                    {[
                        { id: 'discover', label: 'Khám phá', icon: FlagIcon },
                        { id: 'likes', label: 'Trang đã thích', icon: HandThumbUpIcon },
                        { id: 'yours', label: 'Trang của bạn', icon: PresentationChartLineIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <div className={`p-2 rounded-full ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                <tab.icon className="h-5 w-5" />
                            </div>
                            <span>{tab.label}</span>
                        </button>
                    ))}

                    <button className="w-full flex items-center justify-center space-x-2 mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-bold hover:bg-blue-200 transition-colors">
                        <PlusIcon className="h-5 w-5" />
                        <span>Tạo Trang mới</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'discover' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Trang được đề xuất</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pages.map((page) => (
                                <div key={page.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-32 bg-gray-200 relative">
                                        {page.coverPhoto && (
                                            <img src={page.coverPhoto} alt="" className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-lg border-4 border-white overflow-hidden bg-white shadow-sm">
                                            {page.profilePicture ? (
                                                <img src={page.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                                    <FlagIcon className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 pt-8">
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{page.name}</h3>
                                        <p className="text-xs text-gray-500 mb-4">{page.category || 'Cộng đồng'} · {page.likesCount} lượt thích</p>
                                        <button className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors">
                                            <HandThumbUpIcon className="h-5 w-5" />
                                            <span>Thích</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'yours' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Trang của bạn</h2>
                        {myPages.length > 0 ? (
                            <div className="space-y-4">
                                {myPages.map((page) => (
                                    <div key={page.id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                                                {page.profilePicture && <img src={page.profilePicture} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{page.name}</h3>
                                                <p className="text-sm text-gray-500">{page.followersCount} người theo dõi · 0 thông báo mới</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors">
                                            Chuyển sang Trang
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-20 text-center flex flex-col items-center justify-center border">
                                <FlagIcon className="h-20 w-20 text-gray-200 mb-4" />
                                <p className="text-xl font-bold text-gray-800">Bạn chưa quản lý Trang nào</p>
                                <p className="text-gray-500 mt-2">Bắt đầu xây dựng cộng đồng của bạn ngay hôm nay!</p>
                                <button
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                >
                                    Tạo Trang mới
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pages;
