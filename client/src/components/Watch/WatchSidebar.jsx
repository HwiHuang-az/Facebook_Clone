import React from 'react';
import {
    TvIcon,
    VideoCameraIcon,
    BookmarkIcon,
    MagnifyingGlassIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const WatchSidebar = ({ activeSection, setActiveSection }) => {
    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: TvIcon },
        { id: 'live', label: 'Trực tiếp', icon: VideoCameraIcon },
        { id: 'reels', label: 'Reels', icon: VideoCameraIcon },
        { id: 'saved', label: 'Video đã lưu', icon: BookmarkIcon },
    ];

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 shadow-sm h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Video</h1>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Cog6ToothIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm video"
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${activeSection === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <div className={`p-2 rounded-full ${activeSection === item.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WatchSidebar;
