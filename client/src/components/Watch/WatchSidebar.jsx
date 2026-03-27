import React, { useState, useEffect } from 'react';
import {
    TvIcon,
    VideoCameraIcon,
    BookmarkIcon,
    MagnifyingGlassIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const WatchSidebar = ({ activeSection, setActiveSection, searchQuery, setSearchQuery }) => {
    const [localSearch, setLocalSearch] = useState(searchQuery || '');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (setSearchQuery) setSearchQuery(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery]);
    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: TvIcon },
        { id: 'live', label: 'Trực tiếp', icon: VideoCameraIcon },
        { id: 'reels', label: 'Reels', icon: VideoCameraIcon },
        { id: 'saved', label: 'Video đã lưu', icon: BookmarkIcon },
    ];

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Video</h1>
                <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm">
                    <Cog6ToothIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm video"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-facebook-600/50 outline-none text-[15px] font-medium transition-all dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold transition-all group ${activeSection === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${activeSection === item.id ? 'bg-facebook-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-[15px]">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WatchSidebar;
