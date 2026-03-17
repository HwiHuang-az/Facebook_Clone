import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
    CalendarIcon, 
    MapPinIcon, 
    UsersIcon, 
    ChevronLeftIcon,
    GlobeAsiaAustraliaIcon,
    LockClosedIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
    CheckCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { 
    CheckCircleIcon as CheckCircleIconSolid, 
    StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const EventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState([]);
    const [loadingResponses, setLoadingResponses] = useState(false);

    const fetchEventDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/events/${id}`);
            if (res.data.success) {
                setEvent(res.data.data);
            }
        } catch (error) {
            console.error('Fetch event detail error:', error);
            toast.error('Không thể tải thông tin sự kiện');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEventDetail();
    }, [fetchEventDetail]);

    const handleResponse = async (response) => {
        try {
            const res = await api.post(`/events/${id}/respond`, { response });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchEventDetail();
            }
        } catch (error) {
            console.error('Response error:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center">
                <h2 className="text-2xl font-bold">Sự kiện không tồn tại</h2>
                <Link to="/events" className="text-blue-600 hover:underline mt-4 block">Quay lại trang Sự kiện</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen pb-10">
            {/* Header / Cover Section */}
            <div className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-5xl mx-auto">
                    <div className="relative aspect-[21/9] md:aspect-[3/1] bg-gray-200 overflow-hidden md:rounded-b-xl border-x dark:border-gray-700">
                        <img 
                            src={event.coverPhoto || 'https://via.placeholder.com/1200x400?text=Event+Cover'} 
                            alt={event.name}
                            className="w-full h-full object-cover"
                        />
                        <Link 
                            to="/events"
                            className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </Link>
                    </div>

                    <div className="px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <p className="text-red-600 font-bold uppercase text-sm mb-1">
                                {moment(event.startDate).format('dddd, D MMMM YYYY [lúc] HH:mm')}
                            </p>
                            <h1 className="text-2xl md:text-3xl font-extrabold dark:text-white leading-tight mb-2">
                                {event.name}
                            </h1>
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                                {event.privacy === 'public' ? (
                                    <GlobeAsiaAustraliaIcon className="h-4 w-4 mr-1" />
                                ) : (
                                    <LockClosedIcon className="h-4 w-4 mr-1" />
                                )}
                                <span className="mr-3">{event.privacy === 'public' ? 'Sự kiện công khai' : 'Sự kiện riêng tư'}</span>
                                <UsersIcon className="h-4 w-4 mr-1" />
                                <span>{event.goingCount} người tham gia · {event.interestedCount} người quan tâm</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full md:w-auto">
                            <div className="flex-1 md:flex-none flex space-x-2">
                                <button 
                                    onClick={() => handleResponse('interested')}
                                    className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${event.myResponse === 'interested' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200'}`}
                                >
                                    {event.myResponse === 'interested' ? <StarIconSolid className="h-5 w-5" /> : <StarIcon className="h-5 w-5" />}
                                    <span>Quan tâm</span>
                                </button>
                                <button 
                                    onClick={() => handleResponse('going')}
                                    className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${event.myResponse === 'going' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200'}`}
                                >
                                    {event.myResponse === 'going' ? <CheckCircleIconSolid className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                    <span>Đi</span>
                                </button>
                            </div>
                            <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 transition">
                                <ShareIcon className="h-5 w-5" />
                            </button>
                            <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 transition">
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-4 md:px-0 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                        <h2 className="text-xl font-bold dark:text-white mb-6">Chi tiết</h2>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <UsersIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold dark:text-white">{event.goingCount} người sắp tham gia</p>
                                    <div className="flex -space-x-2 mt-2 overflow-hidden">
                                        {/* Mock attendees avatars */}
                                        {[1,2,3,4,5].slice(0, event.goingCount || 0).map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <CalendarIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <p className="font-bold dark:text-white">Bắt đầu lúc {moment(event.startDate).format('HH:mm, dddd, D MMMM YYYY')}</p>
                                    {event.endDate && (
                                        <p className="text-gray-500 text-sm">Kết thúc lúc {moment(event.endDate).format('HH:mm, dddd, D MMMM YYYY')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <MapPinIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <p className="font-bold dark:text-white">{event.location || 'Chưa xác định địa điểm'}</p>
                                    <p className="text-sm text-gray-500">Xem bản đồ để biết chỉ dẫn</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-gray-700">
                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                    {event.description || 'Không có mô tả chi tiết cho sự kiện này.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Discussions / Placeholder */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                        <h2 className="text-xl font-bold dark:text-white mb-4">Thảo luận</h2>
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">Chưa có cuộc thảo luận nào. Hãy bắt đầu!</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Other Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                        <h3 className="font-bold dark:text-white mb-4">Người tổ chức</h3>
                        <Link 
                            to={`/profile/${event.creatorId}`}
                            className="flex items-center space-x-3 group"
                        >
                            <img 
                                src={event.creator?.profilePicture || 'https://via.placeholder.com/50'} 
                                alt="" 
                                className="w-12 h-12 rounded-full object-cover shadow-sm"
                            />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white group-hover:underline">
                                    {event.creator?.firstName} {event.creator?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">Tư cách cá nhân</p>
                            </div>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                        <h3 className="font-bold dark:text-white mb-4">Mời bạn bè</h3>
                        <p className="text-sm text-gray-500 mb-4">Mời người khác cùng tham gia sự kiện này với bạn.</p>
                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                            Mời bạn bè
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
