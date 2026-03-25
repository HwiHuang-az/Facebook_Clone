import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Post from '../components/Home/Post';
import CreatePost from '../components/Home/CreatePost';
import CreateEventModal from '../components/Events/CreateEventModal';
import PageSidebar from '../components/Pages/PageSidebar';
import { toast } from 'react-hot-toast';
import {
    FlagIcon,
    HandThumbUpIcon,
    ChatBubbleOvalLeftIcon,
    ArrowUturnRightIcon,
    EllipsisHorizontalIcon,
    MagnifyingGlassIcon,
    CameraIcon,
    MapPinIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';

const PageDetail = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [page, setPage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [activeTab, setActiveTab] = useState('posts'); // posts, about, likes, events, photos, videos
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [media, setMedia] = useState([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const coverInputRef = React.useRef(null);
    const profileInputRef = React.useRef(null);
    const navigate = useNavigate();

    const fetchPageDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/pages/${id}`);
            if (res.data.success) {
                setPage(res.data.data);
                setIsLiked(res.data.data.isLiked);
                setIsOwner(res.data.data.ownerId === currentUser?.id);
            }
        } catch (error) {
            console.error('Fetch page detail error:', error);
            toast.error('Không thể tải thông tin trang');
        } finally {
            setLoading(false);
        }
    }, [id, currentUser]);

    const fetchPagePosts = useCallback(async () => {
        try {
            setPostLoading(true);
            const res = await api.get(`/posts?pageId=${id}`);
            if (res.data.success) {
                setPosts(res.data.data.posts);
            }
        } catch (error) {
            console.error('Fetch page posts error:', error);
        } finally {
            setPostLoading(false);
        }
    }, [id]);

    const fetchPageMembers = useCallback(async () => {
        try {
            setLoadingMembers(true);
            const res = await api.get(`/pages/${id}/members`);
            if (res.data.success) {
                setMembers(res.data.data);
            }
        } catch (error) {
            console.error('Fetch page members error:', error);
        } finally {
            setLoadingMembers(false);
        }
    }, [id]);

    const fetchPageEvents = useCallback(async () => {
        try {
            setLoadingEvents(true);
            const res = await api.get(`/events?pageId=${id}`);
            if (res.data.success) {
                setEvents(res.data.data);
            }
        } catch (error) {
            console.error('Fetch page events error:', error);
        } finally {
            setLoadingEvents(false);
        }
    }, [id]);

    const fetchPageMedia = useCallback(async (type) => {
        try {
            setLoadingMedia(true);
            const res = await api.get(`/pages/${id}/media?type=${type}`);
            if (res.data.success) {
                setMedia(res.data.data);
            }
        } catch (error) {
            console.error('Fetch page media error:', error);
        } finally {
            setLoadingMedia(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPageDetail();
        fetchPagePosts();
        fetchPageMembers();
        if (activeTab === 'events') fetchPageEvents();
        if (activeTab === 'photos') fetchPageMedia('image');
        if (activeTab === 'videos') fetchPageMedia('video');
    }, [fetchPageDetail, fetchPagePosts, fetchPageMembers, fetchPageEvents, fetchPageMedia, activeTab]);

    const handleLikePage = async () => {
        try {
            const res = await api.post(`/pages/${id}/like`);
            if (res.data.success) {
                setIsLiked(!isLiked);
                setPage(prev => ({
                    ...prev,
                    likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1
                }));
                toast.success(isLiked ? 'Đã bỏ thích trang' : 'Đã thích trang');
                if (activeTab === 'likes') fetchPageMembers();
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleCoverUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Đang cập nhật ảnh bìa...', { id: 'cover' });
            const res = await api.post(`/pages/${id}/cover-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setPage(prev => ({ ...prev, coverPhoto: res.data.data.coverPhoto }));
                toast.success('Cập nhật ảnh bìa thành công', { id: 'cover' });
            }
        } catch (error) {
            console.error('Update cover error:', error);
            toast.error('Không thể cập nhật ảnh bìa', { id: 'cover' });
        }
    };

    const handleProfileUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Đang cập nhật ảnh đại diện...', { id: 'profile' });
            const res = await api.post(`/pages/${id}/profile-picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setPage(prev => ({ ...prev, profilePicture: res.data.data.profilePicture }));
                toast.success('Cập nhật ảnh đại diện thành công', { id: 'profile' });
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Không thể cập nhật ảnh đại diện', { id: 'profile' });
        }
    };

    const handleMessage = () => {
        if (page && page.owner) {
            // Pass the owner object as targetUser in state so Messages page pre-selects the chat
            navigate(`/messages/${page.owner.id}`, { state: { targetUser: page.owner } });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!page) return <div className="text-center py-20 font-bold">Trang không tồn tại</div>;

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white h-full sticky top-0 overflow-y-auto">
                <PageSidebar 
                    activeTab="none" 
                    onTabChange={(tab) => navigate('/pages', { state: { activeTab: tab } })}
                    onCreatePage={() => navigate('/pages', { state: { showCreateModal: true } })}
                    searchQuery=""
                    onSearchChange={(query) => {
                        if (query) {
                            navigate('/pages', { state: { searchQuery: query, activeTab: 'discover' } });
                        }
                    }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-100">
                {/* Header / Cover */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-5xl mx-auto">
                        <div className="relative h-48 md:h-80 bg-gray-200 rounded-b-xl overflow-hidden group">
                            {page.coverPhoto ? (
                                <img src={page.coverPhoto} className="w-full h-full object-cover" alt={page.name} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-400"></div>
                            )}

                            <div className="absolute -bottom-12 left-4 md:left-8 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-md group/avatar cursor-pointer" onClick={() => isOwner && profileInputRef.current?.click()}>
                                {page.profilePicture ? (
                                    <img src={page.profilePicture} alt={page.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                        <FlagIcon className="w-16 h-16 md:w-20 md:h-20" />
                                    </div>
                                )}
                                {isOwner && (
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/avatar:bg-opacity-30 flex items-center justify-center transition-all">
                                        <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={profileInputRef}
                                    onChange={handleProfileUpdate}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            {isOwner && (
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
                                        <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="mt-14 p-4 md:px-8 pb-0">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b">
                                <div className="space-y-1">
                                    <h1 className="text-2xl md:text-3xl font-bold">{page.name}</h1>
                                    <p className="text-gray-500 font-semibold">{page.likesCount} người thích · {page.followersCount || 0} người theo dõi</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleLikePage}
                                        className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${isLiked ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                                    >
                                        {isLiked ? <HandThumbUpIconSolid className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
                                        <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
                                    </button>
                                    <button onClick={handleMessage} className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 flex items-center space-x-2">
                                        <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                                        <span>Nhắn tin</span>
                                    </button>
                                    <button className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300">
                                        <EllipsisHorizontalIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex space-x-1 mt-1">
                                {[
                                    { id: 'posts', label: 'Bài viết' },
                                    { id: 'about', label: 'Giới thiệu' },
                                    { id: 'likes', label: 'Người thích' },
                                    { id: 'events', label: 'Sự kiện' },
                                    { id: 'photos', label: 'Ảnh' },
                                    { id: 'videos', label: 'Video' }
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
                    {activeTab === 'posts' && (
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Intro Sidebar */}
                            <div className="lg:w-[40%] space-y-4">
                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <h2 className="font-bold text-lg mb-4">Giới thiệu</h2>
                                    <p className="text-gray-700 text-sm mb-4">
                                        {page.description || 'Chưa có mô tả cho trang này.'}
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <InformationCircleIcon className="w-5 h-5" />
                                            <span>Trang · {page.category || 'Cộng đồng'}</span>
                                        </div>
                                        {page.location && (
                                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                                <MapPinIcon className="w-5 h-5" />
                                                <span>{page.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Likes Preview Sidebar */}
                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-bold text-lg">Người thích</h2>
                                        <button
                                            onClick={() => setActiveTab('likes')}
                                            className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-2 py-1 rounded"
                                        >
                                            Xem tất cả
                                        </button>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4">{page.likesCount} người thích trang này</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(() => {
                                            const prioritizedLikes = [...members].sort((a, b) => {
                                                if (a.isFriend && !b.isFriend) return -1;
                                                if (!a.isFriend && b.isFriend) return 1;
                                                return 0;
                                            });
                                            return prioritizedLikes.slice(0, 8).map((like) => (
                                                <Link
                                                    key={like.id}
                                                    to={`/profile/${like.userId}`}
                                                    title={`${like.user?.firstName} ${like.user?.lastName}`}
                                                >
                                                    <img
                                                        src={like.user?.profilePicture || `https://ui-avatars.com/api/?name=${like.user?.firstName}+${like.user?.lastName}&background=random`}
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm hover:scale-105 transition-transform"
                                                    />
                                                </Link>
                                            ));
                                        })()}
                                        {members.length > 8 && (
                                            <div
                                                onClick={() => setActiveTab('likes')}
                                                className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs cursor-pointer hover:bg-gray-200 border-2 border-white"
                                            >
                                                +{members.length - 8}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t">
                                        <button
                                            onClick={handleLikePage}
                                            className={`w-full py-2 rounded-lg font-bold text-sm transition ${isLiked ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                                        >
                                            {isLiked ? 'Đã thích trang' : 'Thích trang'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Feed */}
                            <div className="lg:w-[60%] space-y-4">
                                {isOwner && <CreatePost pageId={id} onPostCreated={fetchPagePosts} />}

                                <div className="space-y-4">
                                    {postLoading ? (
                                        <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>
                                    ) : posts.length === 0 ? (
                                        <div className="bg-white p-10 rounded-lg shadow-sm text-center">
                                            <p className="text-gray-500 font-bold">Trang này chưa có bài viết nào.</p>
                                        </div>
                                    ) : (
                                        posts.map(post => (
                                            <Post key={post.id} post={post} onPostUpdate={fetchPagePosts} />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
                            <h2 className="text-xl font-bold mb-6">Giới thiệu</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Mô tả</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{page.description || 'Chưa có mô tả chi tiết cho trang này.'}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t font-semibold">
                                    <div className="flex items-center space-x-3 text-gray-700 font-semibold">
                                        <InformationCircleIcon className="w-6 h-6 text-gray-500" />
                                        <span>{page.category || 'Cộng đồng'}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-700 font-semibold">
                                        <HandThumbUpIcon className="w-6 h-6 text-gray-500" />
                                        <span>{page.likesCount} người thích</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'likes' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                <h2 className="text-xl font-bold">Người thích trang · {page.likesCount}</h2>
                                <div className="relative w-full md:w-64">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {loadingMembers ? (
                                <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
                            ) : (
                                <div className="space-y-4">
                                    {(() => {
                                        const filteredMembers = members.filter(m =>
                                            `${m.user?.firstName} ${m.user?.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
                                        );

                                        const friends = filteredMembers.filter(m => m.isFriend);
                                        const others = filteredMembers.filter(m => !m.isFriend);

                                        const LikeCard = ({ member }) => {
                                            const [requestSent, setRequestSent] = useState(false);

                                            const handleAddFriend = async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                try {
                                                    const res = await api.post('/friendships/request', { receiverId: member.userId });
                                                    if (res.data.success) {
                                                        toast.success('Đã gửi lời mời kết bạn');
                                                        setRequestSent(true);
                                                    }
                                                } catch (error) {
                                                    toast.error(error.response?.data?.message || 'Không thể gửi lời mời');
                                                }
                                            };

                                            return (
                                                <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition group">
                                                    <div className="flex items-center space-x-3 min-w-0">
                                                        <Link to={`/profile/${member.userId}`}>
                                                            <img
                                                                src={member.user?.profilePicture || `https://ui-avatars.com/api/?name=${member.user?.firstName}+${member.user?.lastName}&background=random`}
                                                                alt=""
                                                                className="w-14 h-14 rounded-full object-cover border"
                                                            />
                                                        </Link>
                                                        <div className="min-w-0">
                                                            <Link to={`/profile/${member.userId}`} className="font-bold hover:underline cursor-pointer block leading-tight truncate">
                                                                {member.user?.firstName} {member.user?.lastName}
                                                            </Link>
                                                            {(member.user?.work || member.user?.education) && (
                                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                                    {member.user?.work || member.user?.education}
                                                                </p>
                                                            )}
                                                            {member.isFriend && (
                                                                <p className="text-[10px] text-gray-500 mt-1 flex items-center font-bold">
                                                                    <HandThumbUpIconSolid className="w-3 h-3 mr-1 text-blue-500" />
                                                                    Bạn bè
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-2">
                                                        {member.userId !== currentUser?.id && (
                                                            <>
                                                                {member.isFriend ? (
                                                                    <Link
                                                                        to={`/messenger/${member.userId}`}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition"
                                                                    >
                                                                        Tin nhắn
                                                                    </Link>
                                                                ) : requestSent ? (
                                                                    <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-bold text-xs cursor-default">
                                                                        Đã gửi lời mời
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={handleAddFriend}
                                                                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-200 transition"
                                                                    >
                                                                        Thêm bạn bè
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        };

                                        if (filteredMembers.length === 0) {
                                            return (
                                                <div className="text-center py-20 bg-gray-50 rounded-xl">
                                                    <p className="text-gray-500 italic">
                                                        {memberSearch ? `Không tìm thấy ai khớp với "${memberSearch}"` : 'Chưa có ai thích trang này.'}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-8">
                                                {friends.length > 0 && (
                                                    <section>
                                                        <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Bạn bè ({friends.length})</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {friends.map((member) => (
                                                                <LikeCard
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
                                                        <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b pt-2">Người thích khác ({others.length})</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {others.map((member) => (
                                                                <LikeCard
                                                                    key={member.id}
                                                                    member={member}
                                                                    subText={`Đã thích vào ${new Date(member.createdAt).toLocaleDateString('vi-VN')}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
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
                                <h2 className="text-xl font-bold">Sự kiện từ trang</h2>
                                {isOwner && (
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có sự kiện nào</h3>
                                    <p className="text-gray-500">Trang này chưa có sự kiện nào sắp tới.</p>
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
                        pageId={id}
                        onEventCreated={(newEvent) => {
                            setEvents(prev => [newEvent, ...prev]);
                            fetchPageEvents();
                        }}
                    />

                    {(activeTab === 'photos' || activeTab === 'videos') && (
                        <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
                            <h2 className="text-xl font-bold mb-6">{activeTab === 'photos' ? 'Ảnh' : 'Video'} từ trang</h2>
                            {loadingMedia ? (
                                <div className="text-center py-10">Đang tải...</div>
                            ) : media.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CameraIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có {activeTab === 'photos' ? 'ảnh' : 'video'} nào</h3>
                                    <p className="text-gray-500">Trang này chưa chia sẻ {activeTab === 'photos' ? 'ảnh' : 'video'} nào công khai.</p>
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
        </div>
    );
};

export default PageDetail;
