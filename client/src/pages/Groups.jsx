import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Link, useLocation } from 'react-router-dom';
import {
    RectangleGroupIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserGroupIcon,
    GlobeAsiaAustraliaIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

import GroupSidebar from '../components/Groups/GroupSidebar';
import CreateGroupModal from '../components/Groups/CreateGroupModal';
import MemberRequestsModal from '../components/Groups/MemberRequestsModal';

const Groups = () => {
    const [publicGroups, setPublicGroups] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('feed'); // feed, discover, yours
    const location = useLocation();

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
        if (location.state?.showCreateModal) {
            setShowCreateModal(true);
        }
        if (location.state?.searchQuery) {
            setSearchQuery(location.state.searchQuery);
        }
    }, [location.state]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [publicRes, myRes, suggestRes] = await Promise.all([
                api.get('/groups', { params: { query: searchQuery } }),
                api.get('/groups/my', { params: { query: searchQuery } }),
                api.get('/groups/suggestions')
            ]);
            
            if (publicRes.data.success) setPublicGroups(publicRes.data.data);
            if (myRes.data.success) setMyGroups(myRes.data.data);
            if (suggestRes.data.success) setSuggestions(suggestRes.data.data);
        } catch (error) {
            console.error('Fetch groups error:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden lg:block w-80 lg:sticky lg:top-0 h-[calc(100vh-56px)]">
                <GroupSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onOpenCreateModal={() => setShowCreateModal(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {activeTab === 'discover' && (
                    <div className="space-y-8">
                        {suggestions.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Gợi ý nhóm cho bạn</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {suggestions.map((group) => (
                                        <div key={group.id} className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col p-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                                    {group.coverPhoto && <img src={group.coverPhoto} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate">{group.name}</h3>
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        {group.friends[0].name}{group.friends.length > 1 ? ` và ${group.friends.length - 1} bạn khác` : ''} đã tham gia
                                                    </p>
                                                </div>
                                            </div>
                                            <Link 
                                                to={`/groups/${group.id}`}
                                                className="w-full py-2 bg-blue-100 text-blue-600 rounded-lg font-bold hover:bg-blue-200 transition text-center text-sm"
                                            >
                                                Tham gia nhóm
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-bold mb-6">Nhóm phổ biến</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publicGroups.map((group) => (
                                    <Link to={`/groups/${group.id}`} key={group.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="h-32 bg-gray-200">
                                            {group.coverPhoto && (
                                                <img src={group.coverPhoto} alt={group.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col items-center">
                                            <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{group.membersCount} thành viên</p>
                                            <button className="w-full py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors">
                                                Xem nhóm
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'feed' || activeTab === 'yours') && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">{activeTab === 'feed' ? 'Hoạt động gần đây' : 'Nhóm bạn đã tham gia'}</h2>
                        {myGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myGroups.map((group) => (
                                    <Link to={`/groups/${group.id}`} key={group.id} className="bg-white rounded-lg shadow-sm border overflow-hidden flex items-center p-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden mr-4">
                                            {group.coverPhoto && <img src={group.coverPhoto} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{group.name}</h3>
                                            <p className="text-xs text-gray-500">Lần hoạt động cuối 1 giờ trước</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-20 text-center flex flex-col items-center justify-center border">
                                <RectangleGroupIcon className="h-20 w-20 text-gray-200 mb-4" />
                                <p className="text-xl font-bold text-gray-800">Chưa tham gia nhóm nào</p>
                                <p className="text-gray-500 mt-2">Hãy khám phá các nhóm công khai để bắt đầu tham gia!</p>
                                <button
                                    onClick={() => setActiveTab('discover')}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                >
                                    Khám phá nhóm
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Create Modal */}
            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(newGroup) => {
                        fetchData();
                        setActiveTab('yours');
                    }}
                />
            )}
        </div>
    );
};

export default Groups;
