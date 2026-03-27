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
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Marketplace</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={onShowCreateModal}
                        className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-200 active:scale-95 shadow-sm"
                        title="Tạo niêm yết mới"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                    <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-200 active:scale-95 shadow-sm">
                        <Cog6ToothIcon className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={onSearch} className="mb-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm trên Marketplace"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-facebook-600/50 outline-none text-[15px] font-medium transition-all dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </form>

            {/* Navigation */}
            <div className="space-y-1">
                <button
                    onClick={() => setCategory('')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold transition-all group ${!category ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                >
                    <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${!category ? 'bg-facebook-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <BuildingStorefrontIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[15px]">Lướt xem tất cả</span>
                </button>

                <p className="px-3 py-4 text-gray-500 dark:text-gray-400 font-bold text-sm border-t dark:border-gray-700 mt-4 uppercase">Hạng mục</p>

                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold transition-all group ${category === cat.id ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    >
                        <div className={`w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl text-xl shadow-sm transition-transform group-hover:scale-110 ${category === cat.id ? 'bg-white dark:bg-gray-600 shadow-md' : ''}`}>
                            {cat.icon}
                        </div>
                        <span className="text-[15px]">{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MarketplaceSidebar;
