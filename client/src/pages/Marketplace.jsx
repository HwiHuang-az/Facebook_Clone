import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
    BuildingStorefrontIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    TagIcon,
    Bars3Icon,
    RectangleGroupIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const Marketplace = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');

    const categories = [
        { id: 'vehicles', label: 'Xe cộ', icon: '🚗' },
        { id: 'rentals', label: 'Căn hộ cho thuê', icon: '🏠' },
        { id: 'electronics', label: 'Đồ điện tử', icon: '📱' },
        { id: 'entertainment', label: 'Giải trí', icon: '🎮' },
        { id: 'garden', label: 'Gia đình', icon: '🪴' },
        { id: 'hobbies', label: 'Sở thích', icon: '🎨' },
    ];

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/marketplace', {
                params: {
                    query: searchQuery,
                    category: category
                }
            });
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error('Fetch marketplace items error:', error);
            // toast.error('Không thể tải các mặt hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [category]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems();
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-white shadow-sm h-auto lg:h-[calc(100vh-56px)] lg:sticky lg:top-14 overflow-y-auto p-4 border-r">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Marketplace</h1>
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <PlusIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm trên Marketplace"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-0 focus:ring-0 focus:bg-white text-sm"
                        />
                    </div>
                </form>

                {/* Navigation */}
                <div className="space-y-1">
                    <button
                        onClick={() => setCategory('')}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${!category ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <div className={`p-2 rounded-full ${!category ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <BuildingStorefrontIcon className="h-5 w-5" />
                        </div>
                        <span>Lướt xem tất cả</span>
                    </button>

                    <p className="px-3 py-4 text-gray-500 font-bold text-sm border-t mt-4 uppercase">Hạng mục</p>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${category === cat.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <div className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded-full text-xl">
                                {cat.icon}
                            </div>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Lựa chọn hàng đầu hiện nay</h2>
                    <div className="flex items-center space-x-2 text-blue-600 cursor-pointer hover:underline font-semibold">
                        <MapPinIcon className="h-5 w-5" />
                        <span>Hà Nội · 60 km</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-200"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="aspect-square overflow-hidden bg-gray-100">
                                    {item.images && item.images.length > 0 ? (
                                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="font-bold text-gray-900 line-clamp-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                                    <p className="text-sm text-gray-800 line-clamp-1 mt-0.5">{item.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🛒</div>
                        <p className="text-xl font-bold text-gray-800">Không tìm thấy mặt hàng nào</p>
                        <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm theo từ khóa khác.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
