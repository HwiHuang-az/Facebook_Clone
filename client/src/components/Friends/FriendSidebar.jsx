import React, { useState, useEffect } from 'react';
import {
    UsersIcon,
    UserPlusIcon,
    UserMinusIcon,
    CakeIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const FriendSidebar = ({ activeTab, setActiveTab, counts, searchTerm, setSearchTerm }) => {
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
    const navItems = [
        { id: 'suggestions', label: 'Gợi ý', icon: UserPlusIcon, count: counts.suggestions },
        { id: 'requests', label: 'Lời mời kết bạn', icon: UserMinusIcon, count: counts.requests },
        { id: 'all', label: 'Tất cả bạn bè', icon: UsersIcon, count: counts.friends },
        { id: 'birthdays', label: 'Sinh nhật', icon: CakeIcon, count: counts.birthdays },
    ];

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Bạn bè</h1>
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
                        placeholder="Tìm kiếm bạn bè"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                    />
                </div>
            </div>

            <div className="space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all group ${activeTab === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${activeTab === item.id ? 'bg-facebook-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                }`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="text-[15px]">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.count > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                    {item.count}
                                </span>
                            )}
                            <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FriendSidebar;
