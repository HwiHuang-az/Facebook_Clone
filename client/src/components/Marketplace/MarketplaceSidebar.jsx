import React, { useState, useEffect } from 'react';
import {
    BuildingStorefrontIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const MarketplaceSidebar = ({
    searchQuery,
    setSearchQuery,
    onSearch,
    category,
    setCategory,
    onShowCreateModal,
    categories
}) => {
    const [localSearch, setLocalSearch] = useState(searchQuery || '');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (setSearchQuery) setSearchQuery(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery]);

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);
    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 shadow-sm h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Marketplace</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={onShowCreateModal}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Tạo niêm yết mới"
                    >
                        <PlusIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                    </button>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                        <Cog6ToothIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                    </div>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={onSearch} className="mb-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm trên Marketplace"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                    />
                </div>
            </form>

            {/* Navigation */}
            <div className="space-y-1">
                <button
                    onClick={() => setCategory('')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${!category ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <div className={`p-2 rounded-full ${!category ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <BuildingStorefrontIcon className="h-5 w-5" />
                    </div>
                    <span>Lướt xem tất cả</span>
                </button>

                <p className="px-3 py-4 text-gray-500 dark:text-gray-400 font-bold text-sm border-t dark:border-gray-700 mt-4 uppercase">Hạng mục</p>

                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${category === cat.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <div className="w-9 h-9 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-xl">
                            {cat.icon}
                        </div>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MarketplaceSidebar;
