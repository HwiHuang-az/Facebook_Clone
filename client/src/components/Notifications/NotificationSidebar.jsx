import React from 'react';
import {
    BellIcon,
    CheckIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const NotificationSidebar = ({ activeFilter, setActiveFilter, onMarkAllRead }) => {
    const filters = [
        { id: 'all', label: 'Tất cả', icon: BellIcon },
        { id: 'unread', label: 'Chưa đọc', icon: BellIcon }, // Use the same icon or a different one if preferred
    ];

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe transition-all duration-200">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Thông báo</h1>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-200">
                    <Cog6ToothIcon className="h-6 w-6" />
                </div>
            </div>

            <div className="flex flex-col space-y-1 mb-6">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeFilter === 'all'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <span className="flex-1 text-left text-[15px]">Tất cả</span>
                </button>
                <button
                    onClick={() => setActiveFilter('unread')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeFilter === 'unread'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <span className="flex-1 text-left text-[15px]">Chưa đọc</span>
                </button>
            </div>

            <div className="mt-auto border-t dark:border-gray-700 pt-4">
                <button
                    onClick={onMarkAllRead}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400 rounded-xl font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all active:scale-95 shadow-sm"
                >
                    <CheckIcon className="h-5 w-5" />
                    <span>Đánh dấu tất cả là đã đọc</span>
                </button>
            </div>
        </div>
    );
};

export default NotificationSidebar;
