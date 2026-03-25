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

import { Link, useLocation } from 'react-router-dom';
import MarketplaceSidebar from '../components/Marketplace/MarketplaceSidebar';
import CreateMarketplaceItemModal from '../components/Marketplace/CreateMarketplaceItemModal';
import MarketplaceItemDetailModal from '../components/Marketplace/MarketplaceItemDetailModal';

const Marketplace = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.category) {
            setCategory(location.state.category);
        }
        if (location.state?.searchQuery) {
            setSearchQuery(location.state.searchQuery);
        }
    }, [location.state]);

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
    }, [category, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems();
    };

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
            {/* Sidebar */}
            <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
                <MarketplaceSidebar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSearch={handleSearch}
                    category={category}
                    setCategory={setCategory}
                    categories={categories}
                    onShowCreateModal={() => setShowCreateModal(true)}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
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
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedItem(item)}
                                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                            >
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
            {/* Create Modal */}
            {showCreateModal && (
                <CreateMarketplaceItemModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(newItem) => {
                        fetchItems();
                    }}
                />
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <MarketplaceItemDetailModal 
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
};

export default Marketplace;
