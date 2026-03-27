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
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Lựa chọn hàng đầu hiện nay</h2>
                    <div className="flex items-center space-x-2 text-facebook-600 dark:text-facebook-400 cursor-pointer hover:underline font-bold bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 border border-gray-100 dark:border-gray-700">
                        <MapPinIcon className="h-5 w-5" />
                        <span className="text-sm">Hà Nội · 60 km</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-facebook border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
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
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook border border-transparent dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group active:scale-[0.98]"
                            >
                                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                    {item.images && item.images.length > 0 ? (
                                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">📦</div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        Xem chi tiết
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 transition-colors">
                                    <p className="font-extrabold text-facebook-600 dark:text-facebook-400 text-lg tracking-tight">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </p>
                                    <p className="text-[15px] font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mt-1 group-hover:text-facebook-600 transition-colors">{item.title}</p>
                                    <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 flex items-center">
                                        <MapPinIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                        {item.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook p-20 text-center border border-gray-100 dark:border-gray-700 transition-all duration-200">
                        <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <BuildingStorefrontIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold dark:text-white mb-2 tracking-tight">Không tìm thấy mặt hàng nào</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">Thử thay đổi bộ lọc hoặc tìm kiếm theo từ khóa khác để tìm thấy những gì bạn cần.</p>
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
