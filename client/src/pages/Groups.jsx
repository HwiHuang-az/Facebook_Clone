import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    RectangleGroupIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserGroupIcon,
    GlobeAsiaAustraliaIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

import CreateGroupModal from '../components/Groups/CreateGroupModal';

const Groups = () => {
    const [publicGroups, setPublicGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('feed'); // feed, discover, yours

    const fetchData = async () => {
        try {
            setLoading(true);
            const [publicRes, myRes] = await Promise.all([
                api.get('/groups', { params: { query: searchQuery } }),
                api.get('/groups/my')
            ]);

            if (publicRes.data.success) setPublicGroups(publicRes.data.data);
            if (myRes.data.success) setMyGroups(myRes.data.data);
        } catch (error) {
            console.error('Fetch groups error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchQuery]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-white shadow-sm h-auto lg:h-[calc(100vh-56px)] lg:sticky lg:top-14 overflow-y-auto p-4 border-r">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Nhóm</h1>
                </div>

                {/* Search */}
                <div className="mb-6">
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
                <div className="space-y-1">
                    {[
                        { id: 'feed', label: 'Bảng tin của bạn', icon: RectangleGroupIcon },
                        { id: 'discover', label: 'Khám phá', icon: GlobeAsiaAustraliaIcon },
                        { id: 'yours', label: 'Nhóm của bạn', icon: UserGroupIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <div className={`p-2 rounded-full ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                <tab.icon className="h-5 w-5" />
                            </div>
                            <span>{tab.label}</span>
                        </button>
                    ))}

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full flex items-center justify-center space-x-2 mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-bold hover:bg-blue-200 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Tạo nhóm mới</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {activeTab === 'discover' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Gợi ý cho bạn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {publicGroups.map((group) => (
                                <div key={group.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-32 bg-gray-200">
                                        {group.coverPhoto && (
                                            <img src={group.coverPhoto} alt={group.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col items-center">
                                        <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{group.membersCount} thành viên</p>
                                        <button className="w-full py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors">
                                            Tham gia nhóm
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(activeTab === 'feed' || activeTab === 'yours') && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">{activeTab === 'feed' ? 'Hoạt động gần đây' : 'Nhóm bạn đã tham gia'}</h2>
                        {myGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myGroups.map((group) => (
                                    <div key={group.id} className="bg-white rounded-lg shadow-sm border overflow-hidden flex items-center p-4">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden mr-4">
                                            {group.coverPhoto && <img src={group.coverPhoto} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{group.name}</h3>
                                            <p className="text-xs text-gray-500">Lần hoạt động cuối 1 giờ trước</p>
                                        </div>
                                    </div>
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
