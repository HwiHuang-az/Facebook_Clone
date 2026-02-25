import React from 'react';
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
    onShowCreateCollection
}) => {
    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 shadow-sm h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Mục đã lưu</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={onShowCreateCollection}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-200"
                        title="Tạo bộ sưu tập mới"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-200">
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
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <button
                    onClick={() => setSelectedCollection(null)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${!selectedCollection
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <div className={`p-2 rounded-full ${!selectedCollection ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                        <BookmarkIcon className="h-5 w-5" />
                    </div>
                    <span>Tất cả</span>
                </button>

                {collections.map((coll) => (
                    <button
                        key={coll.collectionName}
                        onClick={() => setSelectedCollection(coll.collectionName)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors ${selectedCollection === coll.collectionName
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-sm">
                                {coll.collectionName.charAt(0)}
                            </div>
                            <span>{coll.collectionName}</span>
                        </div>
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full dark:text-gray-300">
                            {coll.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SavedSidebar;
