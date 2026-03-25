import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Post from '../components/Home/Post';
import CreatePost from '../components/Home/CreatePost';
import CreateEventModal from '../components/Events/CreateEventModal';
import GroupSidebar from '../components/Groups/GroupSidebar';
import CreateGroupModal from '../components/Groups/CreateGroupModal';
import MemberRequestsModal from '../components/Groups/MemberRequestsModal';
import { toast } from 'react-hot-toast';
import {
    UserGroupIcon,
    GlobeAsiaAustraliaIcon,
    LockClosedIcon,
    EllipsisHorizontalIcon,
    MagnifyingGlassIcon,
    CameraIcon,
    UserPlusIcon,
    Cog6ToothIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('discussion'); // discussion, about, members, events, files
    const [showRequests, setShowRequests] = useState(false);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [media, setMedia] = useState([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const coverInputRef = React.useRef(null);

    const fetchGroupDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/groups/${id}`);
            if (res.data.success) {
                setGroup(res.data.data);
                setIsMember(res.data.data.isMember);
                setIsPending(res.data.data.isPending);
                setIsAdmin(res.data.data.adminId === currentUser?.id);
            }
        } catch (error) {
            console.error('Fetch group detail error:', error);
            toast.error('Không thể tải thông tin nhóm');
        } finally {
            setLoading(false);
        }
    }, [id, currentUser]);

    const fetchGroupPosts = useCallback(async () => {
        try {
            setPostLoading(true);
            const res = await api.get(`/posts?groupId=${id}`);
            if (res.data.success) {
                setPosts(res.data.data.posts);
            }
        } catch (error) {
            console.error('Fetch group posts error:', error);
        } finally {
            setPostLoading(false);
        }
    }, [id]);

    const fetchGroupMembers = useCallback(async () => {
        try {
            setLoadingMembers(true);
            const res = await api.get(`/groups/${id}/members`);
            if (res.data.success) {
                setMembers(res.data.data);
            }
        } catch (error) {
            console.error('Fetch group members error:', error);
        } finally {
            setLoadingMembers(false);
        }
    }, [id]);

    const fetchGroupEvents = useCallback(async () => {
        try {
            setLoadingEvents(true);
            const res = await api.get(`/events?groupId=${id}`);
            if (res.data.success) {
                setEvents(res.data.data);
            }
        } catch (error) {
            console.error('Fetch group events error:', error);
        } finally {
            setLoadingEvents(false);
        }
    }, [id]);

    const fetchGroupMedia = useCallback(async () => {
        try {
            setLoadingMedia(true);
            const res = await api.get(`/groups/${id}/media`);
            if (res.data.success) {
                setMedia(res.data.data);
            }
        } catch (error) {
            console.error('Fetch group media error:', error);
        } finally {
            setLoadingMedia(false);
        }
    }, [id]);

    useEffect(() => {
        fetchGroupDetail();
        fetchGroupPosts();
        fetchGroupMembers();
        if (activeTab === 'events') fetchGroupEvents();
        if (activeTab === 'files') fetchGroupMedia();
    }, [fetchGroupDetail, fetchGroupPosts, fetchGroupMembers, fetchGroupEvents, fetchGroupMedia, activeTab]);

    const handleJoinGroup = async () => {
        try {
            const res = await api.post(`/groups/${id}/join`);
            if (res.data.success) {
                setIsMember(true);
                setGroup(prev => ({ ...prev, membersCount: prev.membersCount + 1 }));
                toast.success('Đã tham gia nhóm');
                fetchGroupPosts();
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleAddFriend = async (userId) => {
        try {
            const res = await api.post('/friendships/request', { receiverId: userId });
            if (res.data.success) {
                toast.success('Đã gửi lời mời kết bạn');
            }
        } catch (error) {
            console.error('Add friend error:', error);
            toast.error(error.response?.data?.message || 'Không thể gửi lời mời kết bạn');
        }
    };

    const handleCoverUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Đang cập nhật ảnh bìa...', { id: 'cover' });
            const res = await api.post(`/groups/${id}/cover-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setGroup(prev => ({ ...prev, coverPhoto: res.data.data.coverPhoto }));
                toast.success('Cập nhật ảnh bìa thành công', { id: 'cover' });
            }
        } catch (error) {
            console.error('Update cover error:', error);
            toast.error('Không thể cập nhật ảnh bìa', { id: 'cover' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!group) return <div className="text-center py-20 font-bold">Nhóm không tồn tại</div>;

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white h-full sticky top-0 overflow-y-auto">
                <GroupSidebar 
                    activeTab="none" 
                    onTabChange={(tab) => navigate('/groups', { state: { activeTab: tab } })}
                    onOpenCreateModal={() => navigate('/groups', { state: { showCreateModal: true } })}
                    searchQuery=""
                    onSearchChange={(query) => {
                        if (query) {
                            navigate('/groups', { state: { searchQuery: query, activeTab: 'discover' } });
                        }
                    }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-100">
                {/* Header / Cover */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="relative h-48 md:h-80 bg-gray-200 rounded-b-xl overflow-hidden group">
                            {group.coverPhoto ? (
                                <img src={group.coverPhoto} className="w-full h-full object-cover" alt={group.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600">
                                    <UserGroupIcon className="w-20 h-20 text-white opacity-50" />
                                </div>
                            )}
                            {isAdmin && (
                                <>
                                    <input
                                        type="file"
                                        ref={coverInputRef}
                                        onChange={handleCoverUpdate}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <button
                                        onClick={() => coverInputRef.current?.click()}
                                        className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow-md hover:bg-gray-50 border"
                                    >
                                        <CameraIcon className="w-5 h-5" />
                                        <span>Chỉnh sửa ảnh bìa</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="p-4 md:px-8 pb-0">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b">
                                <div className="space-y-1">
                                    <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>
                                    <div className="flex items-center space-x-2 text-gray-500 font-semibold text-sm">
                                        {group.privacy === 'public' ? (
                                            <GlobeAsiaAustraliaIcon className="w-4 h-4" />
                                        ) : (
                                            <LockClosedIcon className="w-4 h-4" />
                                        )}
                                        <span>{group.privacy === 'public' ? 'Nhóm Công khai' : 'Nhóm Riêng tư'}</span>
                                        <span>·</span>
                                        <span>{group.membersCount} thành viên</span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {!isMember && !isPending && (
                                        <button
                                            onClick={handleJoinGroup}
                                            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                                        >
                                            Tham gia nhóm
                                        </button>
                                    )}
                                    {isPending && (
                                        <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold">
                                            Yêu cầu đã gửi
                                        </button>
                                    )}
                                    {isMember && (
                                        <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 flex items-center space-x-2">
                                            <UserGroupIcon className="w-5 h-5" />
                                            <span>Đã tham gia</span>
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button
                                            onClick={() => setShowRequests(true)}
                                            className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 flex items-center space-x-2 shadow-sm"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span className="hidden md:inline">Duyệt thành viên</span>
                                        </button>
                                    )}
                                    <button className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300">
                                        <EllipsisHorizontalIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex space-x-1 mt-1">
                                {[
                                    { id: 'discussion', label: 'Thảo luận' },
                                    { id: 'about', label: 'Giới thiệu' },
                                    { id: 'members', label: 'Thành viên' },
                                    { id: 'events', label: 'Sự kiện' },
                                    { id: 'files', label: 'File' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-3 font-semibold text-gray-600 border-b-4 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent hover:bg-gray-50'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto px-4 py-4">
                    {activeTab === 'discussion' && (
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Posts Column */}
                            <div className="lg:w-[60%] space-y-4">
                                {isMember && <CreatePost groupId={id} onPostCreated={fetchGroupPosts} />}

                                <div className="space-y-4">
                                    {postLoading ? (
                                        <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>
                                    ) : posts.length === 0 ? (
                                        <div className="bg-white p-10 rounded-lg shadow-sm text-center">
                                            <p className="text-gray-500 font-bold">Chưa có bài viết nào trong nhóm này.</p>
                                        </div>
                                    ) : (
                                        posts.map(post => (
                                            <Post key={post.id} post={post} onPostUpdate={fetchGroupPosts} isAdmin={isAdmin} />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Column */}
                            <div className="lg:w-[40%] space-y-4">
                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <h2 className="font-bold text-lg mb-4">Giới thiệu</h2>
                                    <p className="text-gray-700 text-sm mb-4">
                                        {group.description || 'Chào mừng bạn đến với nhóm!'}
                                    </p>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-start space-x-3">
                                            <GlobeAsiaAustraliaIcon className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="font-bold">Công khai</p>
                                                <p className="text-gray-500">Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="font-bold">Hiển thị</p>
                                                <p className="text-gray-500">Ai cũng có thể tìm thấy nhóm này.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Member Preview Sidebar */}
                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-bold text-lg">Thành viên</h2>
                                        <button
                                            onClick={() => setActiveTab('members')}
                                            className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-2 py-1 rounded"
                                        >
                                            Xem tất cả
                                        </button>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4">{group.membersCount} thành viên</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(() => {
                                            const prioritizedMembers = [...members].sort((a, b) => {
                                                if (a.isFriend && !b.isFriend) return -1;
                                                if (!a.isFriend && b.isFriend) return 1;
                                                return 0;
                                            });
                                            return prioritizedMembers.slice(0, 8).map((member) => (
                                                <Link
                                                    key={member.id}
                                                    to={`/profile/${member.userId}`}
                                                    className="relative"
                                                    title={`${member.user?.firstName} ${member.user?.lastName}`}
                                                >
                                                    <img
                                                        src={member.user?.profilePicture || `https://ui-avatars.com/api/?name=${member.user?.firstName}+${member.user?.lastName}&background=random`}
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm hover:scale-105 transition-transform"
                                                    />
                                                    {member.role === 'admin' && (
                                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                        </div>
                                                    )}
                                                </Link>
                                            ));
                                        })()}
                                        {members.length > 8 && (
                                            <div
                                                onClick={() => setActiveTab('members')}
                                                className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs cursor-pointer hover:bg-gray-200 border-2 border-white"
                                            >
                                                +{members.length - 8}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleJoinGroup}
                                        className={`w-full py-2 rounded-lg font-bold text-sm transition ${isMember ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        {isMember ? 'Quản lý thông báo' : 'Tham gia nhóm'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
                            <h2 className="text-xl font-bold mb-4">Giới thiệu về nhóm này</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Mô tả</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{group.description || 'Chưa có mô tả chi tiết cho nhóm này.'}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t font-semibold">
                                    <div className="flex items-center space-x-3">
                                        <GlobeAsiaAustraliaIcon className="w-6 h-6 text-gray-500" />
                                        <span>{group.privacy === 'public' ? 'Nhóm Công khai' : 'Nhóm Riêng tư'}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <UserGroupIcon className="w-6 h-6 text-gray-500" />
                                        <span>{group.membersCount} thành viên</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                <h2 className="text-xl font-bold">Thành viên · {group.membersCount}</h2>
                                <div className="relative w-full md:w-64">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm thành viên..."
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {loadingMembers ? (
                                <div className="text-center py-10 text-gray-500">Đang tải danh sách thành viên...</div>
                            ) : (
                                <div className="space-y-8">
                                    {(() => {
                                        const filteredMembers = members.filter(m =>
                                            `${m.user?.firstName} ${m.user?.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
                                        );

                                        const admins = filteredMembers.filter(m => m.role === 'admin' || m.role === 'moderator');
                                        const experts = filteredMembers.filter(m => m.role === 'expert');
                                        const friends = filteredMembers.filter(m => m.isFriend && m.role === 'member');
                                        const others = filteredMembers.filter(m => !m.isFriend && (m.role === 'member' || !m.role));

                                        const MemberCard = ({ member, subText, showAddFriend = false }) => (
                                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition group rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Link to={`/profile/${member.userId}`} className="relative">
                                                        <img
                                                            src={member.user?.profilePicture || `https://ui-avatars.com/api/?name=${member.user?.firstName}+${member.user?.lastName}&background=random`}
                                                            alt=""
                                                            className="w-14 h-14 rounded-full object-cover border"
                                                        />
                                                    </Link>
                                                    <div>
                                                        <Link to={`/profile/${member.userId}`} className="font-bold text-gray-900 hover:underline block leading-tight">
                                                            {member.user?.firstName} {member.user?.lastName}
                                                        </Link>

                                                        {subText && (
                                                            <p className={member.role === 'admin' || member.role === 'moderator' || member.role === 'expert' ? "text-[11px] text-blue-600 font-bold mt-0.5" : "text-xs text-gray-500 mt-0.5"}>
                                                                {subText}
                                                            </p>
                                                        )}

                                                        {(member.user?.work || member.user?.education) && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {member.user?.work ? `${member.user.work}` : `${member.user.education}`}
                                                            </p>
                                                        )}

                                                        {member.isFriend && member.role === 'member' && (
                                                            <p className="text-[10px] text-gray-500 mt-1 flex items-center">
                                                                <UserGroupIcon className="w-3 h-3 mr-1" />
                                                                Bạn bè
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {member.userId !== currentUser?.id && (
                                                        <div className="flex items-center space-x-2">
                                                            {isAdmin && member.role !== 'admin' && (
                                                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                                                    <select 
                                                                        value={member.role}
                                                                        onChange={async (e) => {
                                                                            try {
                                                                                const res = await api.post(`/groups/${id}/change-role/${member.userId}`, { role: e.target.value });
                                                                                if (res.data.success) {
                                                                                    toast.success('Đã cập nhật vai trò');
                                                                                    fetchGroupMembers();
                                                                                }
                                                                            } catch (err) { toast.error('Lỗi cập nhật'); }
                                                                        }}
                                                                        className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer"
                                                                    >
                                                                        <option value="member">Thành viên</option>
                                                                        <option value="moderator">Người kiểm duyệt</option>
                                                                        <option value="expert">Chuyên gia</option>
                                                                    </select>
                                                                </div>
                                                            )}
                                                            {showAddFriend && !member.isFriend && (
                                                                <button
                                                                    onClick={() => handleAddFriend(member.userId)}
                                                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-bold text-sm transition"
                                                                >
                                                                    <UserPlusIcon className="w-5 h-5" />
                                                                    <span>Thêm bạn bè</span>
                                                                </button>
                                                            )}
                                                            {member.isFriend && (
                                                                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-bold text-sm transition">Nhắn tin</button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <div className="space-y-8">
                                                {admins.length > 0 && (
                                                    <section>
                                                        <h3 className="font-bold text-gray-900 mb-4">Quản trị viên và người kiểm duyệt · {admins.length}</h3>
                                                        <div className="space-y-4">
                                                            {admins.slice(0, 5).map((member) => (
                                                                <MemberCard
                                                                    key={member.id}
                                                                    member={member}
                                                                    subText={member.role === 'admin' ? 'Quản trị viên' : 'Người kiểm duyệt'}
                                                                    showAddFriend={true}
                                                                />
                                                            ))}
                                                        </div>
                                                        {admins.length > 5 && (
                                                            <button className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-sm transition text-gray-700">Xem tất cả</button>
                                                        )}
                                                    </section>
                                                )}

                                                {experts.length > 0 && (
                                                    <section>
                                                        <div className="mb-4">
                                                            <h3 className="font-bold text-gray-900 flex items-center">
                                                                Chuyên gia trong nhóm · {experts.length}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Chuyên gia trong nhóm là người am hiểu về chủ đề của nhóm và sẽ do quản trị viên lựa chọn. Họ nhận được huy hiệu bên cạnh tên mình và hỗ trợ giải đáp thắc mắc. <span className="text-blue-600 cursor-pointer hover:underline">Tìm hiểu thêm</span>
                                                            </p>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {experts.map((member) => (
                                                                <MemberCard
                                                                    key={member.id}
                                                                    member={member}
                                                                    subText="Chuyên gia trong nhóm"
                                                                    showAddFriend={true}
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}

                                                {friends.length > 0 && (
                                                    <section>
                                                        <h3 className="font-bold text-gray-900 mb-4 pt-2">Bạn bè ({friends.length})</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {friends.map((member) => (
                                                                <MemberCard
                                                                    key={member.id}
                                                                    member={member}
                                                                    subText="Bạn bè"
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}

                                                {others.length > 0 && (
                                                    <section>
                                                        <h3 className="font-bold text-gray-900 mb-4 pt-2">Thành viên mới trong nhóm</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {others.map((member) => (
                                                                <MemberCard
                                                                    key={member.id}
                                                                    member={member}
                                                                    showAddFriend={true}
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}

                                                {filteredMembers.length === 0 && memberSearch && (
                                                    <div className="text-center py-20 bg-gray-50 rounded-xl">
                                                        <p className="text-gray-500 italic">Không tìm thấy thành viên nào khớp với "{memberSearch}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Sự kiện sắp tới</h2>
                                {isMember && (
                                    <button
                                        onClick={() => setShowCreateEvent(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
                                    >
                                        Tạo sự kiện mới
                                    </button>
                                )}
                            </div>
                            {loadingEvents ? (
                                <div className="text-center py-10">Đang tải sự kiện...</div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không có sự kiện nào</h3>
                                    <p className="text-gray-500">Nhóm này chưa tổ chức sự kiện nào sắp tới.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {events.map(event => (
                                        <div key={event.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50">
                                            <div className="h-32 bg-gray-200 relative">
                                                {event.coverPhoto && <img src={event.coverPhoto} className="w-full h-full object-cover" />}
                                                <div className="absolute top-2 left-2 bg-white rounded-lg p-1 px-2 text-center flex flex-col items-center">
                                                    <span className="text-xs text-red-500 font-bold uppercase">{new Date(event.startDate).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                                                    <span className="text-lg font-bold leading-none">{new Date(event.startDate).getDate()}</span>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-bold text-gray-900 line-clamp-1">{event.name}</h4>
                                                <p className="text-sm text-gray-500 font-semibold">{new Date(event.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {event.location || 'Trực tuyến'}</p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-bold">{event.interestedCount} quan tâm · {event.goingCount} tham gia</span>
                                                    <button className="text-blue-600 hover:bg-blue-50 p-1 px-2 rounded-lg font-bold text-xs border border-blue-600">Phản hồi</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <CreateEventModal
                        isOpen={showCreateEvent}
                        onClose={() => setShowCreateEvent(false)}
                        groupId={id}
                        onEventCreated={(newEvent) => {
                            setEvents(prev => [newEvent, ...prev]);
                            fetchGroupEvents();
                        }}
                    />

                    {activeTab === 'files' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
                            <h2 className="text-xl font-bold mb-6">Ảnh và Video từ nhóm</h2>
                            {loadingMedia ? (
                                <div className="text-center py-10">Đang tải tài liệu...</div>
                            ) : media.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CameraIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có ảnh hay video nào</h3>
                                    <p className="text-gray-500">Mọi người chưa chia sẻ hình ảnh hoặc video nào trong nhóm này.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {media.map((item, index) => (
                                        <Link key={index} to={`/post/${item.postId}`} className="aspect-square relative group overflow-hidden rounded-lg bg-gray-100">
                                            {item.type === 'image' ? (
                                                <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                                            ) : (
                                                <div className="w-full h-full relative">
                                                    <video src={item.url} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                                                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                                                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        window.location.reload(); // Simple refresh for now
                    }}
                />
            )}
            {showRequests && (
                <MemberRequestsModal 
                    groupId={id} 
                    onClose={() => setShowRequests(false)}
                    onUpdate={() => {
                        fetchGroupDetail();
                        fetchGroupMembers();
                    }}
                />
            )}
        </div>
    );
};

export default GroupDetail;
