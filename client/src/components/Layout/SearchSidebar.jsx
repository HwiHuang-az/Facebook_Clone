import React from 'react';
import { 
    NewspaperIcon, 
    UserIcon, 
    UserGroupIcon, 
    FlagIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
    VideoCameraIcon,
    BuildingStorefrontIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const SearchSidebar = ({ activeTab, setActiveTab }) => {
    const filters = [
        { id: 'all', label: 'Tất cả', icon: NewspaperIcon },
        { id: 'users', label: 'Mọi người', icon: UserIcon },
        { id: 'posts', label: 'Bài viết', icon: NewspaperIcon },
        { id: 'groups', label: 'Nhóm', icon: UserGroupIcon },
        { id: 'pages', label: 'Trang', icon: FlagIcon },
    ];

    const moreFilters = [
        { id: 'photos', label: 'Ảnh', icon: PhotoIcon },
        { id: 'videos', label: 'Video', icon: VideoCameraIcon },
        { id: 'marketplace', label: 'Marketplace', icon: BuildingStorefrontIcon },
        { id: 'events', label: 'Sự kiện', icon: CalendarIcon },
    ];

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 shadow-sm h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe">
            <h1 className="text-2xl font-bold dark:text-white mb-6">Kết quả tìm kiếm</h1>
            
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">Bộ lọc</h3>
                <div className="flex flex-col space-y-1">
                    {filters.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${activeTab === item.id
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                }`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="flex-1 text-left text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
                <div className="flex flex-col space-y-1">
                    {moreFilters.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${activeTab === item.id
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                }`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="flex-1 text-left text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchSidebar;
