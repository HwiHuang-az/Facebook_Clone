import React, { useState, useEffect } from 'react';
import {
    CalendarIcon,
    MapPinIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    UsersIcon,
    CheckCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import CreateEventModal from '../components/Events/CreateEventModal';
import EventSidebar from '../components/Events/EventSidebar';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'my_events'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/events?type=${activeTab}`);
            if (res.data.success) {
                setEvents(res.data.data);
            }
        } catch (error) {
            console.error('Fetch events error:', error);
            toast.error('Không thể tải danh sách sự kiện');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [activeTab]);

    const handleResponse = async (eventId, response) => {
        try {
            const res = await api.post(`/events/${eventId}/respond`, { response });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchEvents();
            }
        } catch (error) {
            console.error('Response error:', error);
            toast.error('Thao tác thất bại');
        }
    };

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
            {/* Sidebar */}
            <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
                <EventSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onShowCreateModal={() => setIsCreateModalOpen(true)}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="mb-6 flex items-center justify-between lg:hidden text-gray-900 dark:text-white">
                        <h1 className="text-2xl font-bold">Sự kiện</h1>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 shadow-sm"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Tạo sự kiện mới</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-20 text-center">
                            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold dark:text-white">Chưa có sự kiện nào</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Hãy khám phá các sự kiện thú vị quanh bạn.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {events.map(event => (
                                <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col group border dark:border-gray-700 transition-all hover:shadow-md">
                                    <Link to={`/events/${event.id}`} className="aspect-video relative overflow-hidden bg-gray-200">
                                        <img
                                            src={event.coverPhoto || 'https://via.placeholder.com/800x450?text=Event'}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            alt={event.name}
                                        />
                                        <div className="absolute top-3 left-3 bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col items-center shadow-lg min-w-[50px]">
                                            <span className="text-red-600 text-[10px] font-bold uppercase">
                                                Tháng {new Date(event.startDate).getMonth() + 1}
                                            </span>
                                            <span className="text-xl font-bold dark:text-white">
                                                {new Date(event.startDate).getDate()}
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <Link to={`/events/${event.id}`}>
                                                <h3 className="text-lg font-bold dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {event.name}
                                                </h3>
                                            </Link>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                                    <span>
                                                        {new Date(event.startDate).toLocaleDateString('vi-VN', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <MapPinIcon className="h-4 w-4 mr-2" />
                                                    <span className="truncate">{event.location || 'Địa điểm chưa cập nhật'}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                <UsersIcon className="h-4 w-4" />
                                                <span>{event.goingCount} người tham gia · {event.interestedCount} người quan tâm</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t dark:border-gray-700 flex gap-2">
                                            <button
                                                onClick={() => handleResponse(event.id, 'going')}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${event.myResponse === 'going' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                            >
                                                {event.myResponse === 'going' ? <CheckCircleIconSolid className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                                                <span>Tham gia</span>
                                            </button>
                                            <button
                                                onClick={() => handleResponse(event.id, 'interested')}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${event.myResponse === 'interested' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                            >
                                                {event.myResponse === 'interested' ? <StarIconSolid className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
                                                <span>Quan tâm</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateEventModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreated={fetchEvents}
                />
            )}
        </div>
    );
};

export default EventsPage;
