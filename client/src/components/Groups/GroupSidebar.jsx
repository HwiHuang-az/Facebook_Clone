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

const GroupSidebar = ({ activeTab, onTabChange }) => {
    const [myGroups, setMyGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    useEffect(() => {
        const fetchMyGroups = async () => {
            try {
                const res = await api.get('/groups/my');
                if (res.data.success) {
                    setMyGroups(res.data.data);
                }
            } catch (error) {
                console.error('Fetch my groups error:', error);
            }
        };
        fetchMyGroups();
    }, []);

    const isActive = (tab) => activeTab === tab;

    return (
        <div className="w-full lg:w-90 bg-white shadow-sm h-full overflow-y-auto p-4 border-r flex flex-col pt-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Nhóm</h1>
                <div className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition">
                    <Cog6ToothIcon className="h-6 w-6 text-gray-700" />
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhóm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-0 focus:ring-0 focus:bg-white text-sm"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="space-y-1 mb-6">
                <Link
                    to="/groups"
                    onClick={() => onTabChange?.('feed')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('feed') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-full ${isActive('feed') ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        <RectangleGroupIcon className="h-5 w-5" />
                    </div>
                    <span>Bảng feed của bạn</span>
                </Link>

                <Link
                    to="/groups"
                    onClick={() => onTabChange?.('discover')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('discover') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-full ${isActive('discover') ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        <GlobeAsiaAustraliaIcon className="h-5 w-5" />
                    </div>
                    <span>Khám phá</span>
                </Link>

                <Link
                    to="/groups"
                    onClick={() => onTabChange?.('yours')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('yours') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-full ${isActive('yours') ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        <UserGroupIcon className="h-5 w-5" />
                    </div>
                    <span>Nhóm của bạn</span>
                </Link>

                <button
                    className="w-full flex items-center justify-center space-x-2 mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-bold hover:bg-blue-200 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Tạo nhóm mới</span>
                </button>
            </div>

            {/* Joined Groups List */}
            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="font-bold text-gray-900">Nhóm bạn đã tham gia</h2>
                    <Link to="/groups" className="text-blue-600 text-sm hover:bg-blue-50 px-2 py-1 rounded">Xem tất cả</Link>
                </div>

                <div className="space-y-1">
                    {myGroups.map((group) => (
                        <Link
                            to={`/groups/${group.id}`}
                            key={group.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition group"
                        >
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                {group.coverPhoto ? (
                                    <img src={group.coverPhoto} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <UserGroupIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate text-sm">{group.name}</h3>
                                <p className="text-[11px] text-gray-500 truncate font-medium">Lần hoạt động cuối: 1 giờ trước</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupSidebar;
