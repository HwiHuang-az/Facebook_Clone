import React from 'react';
import {
    UsersIcon,
    UserPlusIcon,
    UserMinusIcon,
    CakeIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const FriendSidebar = ({ activeTab, setActiveTab, counts }) => {
    const navItems = [
        { id: 'suggestions', label: 'Gợi ý', icon: UserPlusIcon, count: counts.suggestions },
        { id: 'requests', label: 'Lời mời kết bạn', icon: UserMinusIcon, count: counts.requests },
        { id: 'all', label: 'Tất cả bạn bè', icon: UsersIcon, count: counts.friends },
        { id: 'birthdays', label: 'Sinh nhật', icon: CakeIcon, count: counts.birthdays },
    ];

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 shadow-sm h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Bạn bè</h1>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Cog6ToothIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </div>
            </div>

            <div className="space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors ${activeTab === item.id
                                ? 'bg-gray-100 dark:bg-gray-700 text-blue-600'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                                }`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span>{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.count > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {item.count}
                                </span>
                            )}
                            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FriendSidebar;
