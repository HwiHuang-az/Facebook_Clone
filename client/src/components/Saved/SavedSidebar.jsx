import React, { useState, useEffect } from 'react';
import {
    BookmarkIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const SavedSidebar = ({
    collections,
    selectedCollection,
    setSelectedCollection,
    searchTerm,
    setSearchTerm,
    onShowCreateCollection
}) => {
    const [localSearch, setLocalSearch] = useState(searchTerm || '');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (setSearchTerm) setSearchTerm(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, setSearchTerm]);

    useEffect(() => {
        setLocalSearch(searchTerm);
    }, [searchTerm]);
    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Mục đã lưu</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={onShowCreateCollection}
                        className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-200 active:scale-95 shadow-sm"
                        title="Tạo bộ sưu tập mới"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                    <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-200 active:scale-95 shadow-sm">
                        <Cog6ToothIcon className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm mục đã lưu"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <button
                    onClick={() => setSelectedCollection(null)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold transition-all group ${!selectedCollection
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${!selectedCollection ? 'bg-facebook-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }`}>
                        <BookmarkIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[15px]">Tất cả</span>
                </button>

                {collections.map((coll) => (
                    <button
                        key={coll.collectionName}
                        onClick={() => setSelectedCollection(coll.collectionName)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all group ${selectedCollection === coll.collectionName
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-110 ${
                                selectedCollection === coll.collectionName 
                                ? 'bg-facebook-600 text-white' 
                                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200'
                            }`}>
                                {coll.collectionName.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate text-[15px]">{coll.collectionName}</span>
                        </div>
                        <span className="text-[11px] font-bold bg-gray-200 dark:bg-gray-700 px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                            {coll.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SavedSidebar;
