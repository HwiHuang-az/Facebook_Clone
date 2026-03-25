import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import {
    RectangleGroupIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserGroupIcon,
    GlobeAsiaAustraliaIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const GroupSidebar = ({ activeTab, onTabChange, onOpenCreateModal, searchQuery, onSearchChange }) => {
    const [myGroups, setMyGroups] = useState([]);
    const [localSearch, setLocalSearch] = useState(searchQuery || '');
    const location = useLocation();

    useEffect(() => {
        const fetchMyGroups = async () => {
            try {
                const res = await api.get('/groups/my', { params: { query: searchQuery } });
                if (res.data.success) {
                    setMyGroups(res.data.data);
                }
            } catch (error) {
                console.error('Fetch my groups error:', error);
            }
        };
        fetchMyGroups();
    }, [searchQuery]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearchChange) onSearchChange(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    const isActive = (tab) => activeTab === tab;

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col pt-4 font-segoe transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Nhóm</h1>
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
                        placeholder="Tìm kiếm nhóm"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="space-y-1 mb-6">
                <Link
                    to="/groups"
                    onClick={() => onTabChange?.('feed')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold transition-all group ${isActive('feed') ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                >
                    <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${isActive('feed') ? 'bg-facebook-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                        <RectangleGroupIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[15px]">Bảng feed của bạn</span>
                </Link>

                <Link
                    to="/groups"
                    onClick={() => onTabChange?.('discover')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold transition-all group ${isActive('discover') ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                >
                    <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${isActive('discover') ? 'bg-facebook-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                        <GlobeAsiaAustraliaIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[15px]">Khám phá</span>
                </Link>

                <Link
                    to="/groups"
                    onClick={() => onTabChange?.('yours')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold transition-all group ${isActive('yours') ? 'bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                >
                    <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${isActive('yours') ? 'bg-facebook-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                        <UserGroupIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[15px]">Nhóm của bạn</span>
                </Link>

                <button
                    onClick={onOpenCreateModal}
                    className="w-full flex items-center justify-center space-x-2 mt-4 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400 rounded-xl font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all active:scale-95 shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Tạo nhóm mới</span>
                </button>
            </div>

            {/* Joined Groups List */}
            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="font-bold text-gray-900 dark:text-white">Nhóm bạn đã tham gia</h2>
                    <Link to="/groups" className="text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded">Xem tất cả</Link>
                </div>

                <div className="space-y-1">
                    {myGroups.map((group) => (
                        <Link
                            to={`/groups/${group.id}`}
                        key={group.id}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 border border-gray-100 dark:border-gray-700">
                            {group.coverPhoto ? (
                                <img src={group.coverPhoto} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-facebook-600 dark:text-facebook-400">
                                    <UserGroupIcon className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate text-[15px] group-hover:text-facebook-600 dark:group-hover:text-facebook-400 transition-colors">{group.name}</h3>
                                <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate font-medium">Lần hoạt động cuối: 1 giờ trước</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupSidebar;
