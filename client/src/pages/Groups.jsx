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
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <div className="hidden lg:block w-90 lg:sticky lg:top-0 h-[calc(100vh-56px)] border-r border-gray-100 dark:border-gray-800 transition-all">
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
                    <div className="space-y-8 max-w-6xl mx-auto">
                        {suggestions.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 dark:text-white">Gợi ý nhóm cho bạn</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {suggestions.map((group) => (
                                        <div key={group.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col p-5 group transition-all hover:shadow-xl">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 dark:border-gray-600 transition-transform group-hover:scale-110">
                                                    {group.coverPhoto && <img src={group.coverPhoto} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg group-hover:text-facebook-600 transition-colors">{group.name}</h3>
                                                    <p className="text-[11px] text-facebook-600 dark:text-facebook-400 font-bold uppercase tracking-wider">
                                                        {group.friends[0].name}{group.friends.length > 1 ? ` và ${group.friends.length - 1} bạn khác` : ''} đã tham gia
                                                    </p>
                                                </div>
                                            </div>
                                            <Link 
                                                to={`/groups/${group.id}`}
                                                className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/30 text-facebook-600 dark:text-facebook-400 rounded-xl font-bold hover:bg-facebook-600 hover:text-white dark:hover:bg-facebook-600 dark:hover:text-white transition-all text-center text-sm active:scale-95 shadow-sm"
                                            >
                                                Tham gia nhóm
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-bold mb-6 dark:text-white">Nhóm phổ biến</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publicGroups.map((group) => (
                                    <Link to={`/groups/${group.id}`} key={group.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group active:scale-[0.98]">
                                        <div className="h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            {group.coverPhoto && (
                                                <img src={group.coverPhoto} alt={group.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col items-center">
                                            <h3 className="font-bold text-lg mb-1 dark:text-white group-hover:text-facebook-600 transition-colors uppercase tracking-tight">{group.name}</h3>
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-5">{group.membersCount} thành viên</p>
                                            <button className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-sm">
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
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-xl font-bold mb-6 dark:text-white">
                            {activeTab === 'feed' ? 'Hoạt động gần đây' : 'Nhóm bạn đã tham gia'}
                        </h2>
                        {myGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myGroups.map((group) => (
                                    <Link to={`/groups/${group.id}`} key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-facebook border border-gray-100 dark:border-gray-700 overflow-hidden flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group active:scale-[0.98] shadow-sm">
                                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mr-4 shrink-0 shadow-sm border border-gray-100 dark:border-gray-600 transition-transform group-hover:scale-105">
                                            {group.coverPhoto && <img src={group.coverPhoto} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-facebook-600 transition-colors">{group.name}</h3>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase">Hoạt động mới</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-facebook p-20 text-center flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 transition-all duration-200">
                                <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <RectangleGroupIcon className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold dark:text-white mb-2 tracking-tight">Chưa tham gia nhóm nào</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">Hãy khám phá các nhóm công khai để bắt đầu tham gia và kết nối với mọi người!</p>
                                <button
                                    onClick={() => setActiveTab('discover')}
                                    className="mt-8 px-8 py-3 bg-facebook-600 text-white rounded-xl font-bold hover:bg-facebook-700 transition-all shadow-lg active:scale-95"
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
