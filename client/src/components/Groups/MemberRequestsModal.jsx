import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MemberRequestsModal = ({ groupId, onClose, onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get(`/groups/${groupId}/pending-members`);
                if (res.data.success) {
                    setRequests(res.data.data);
                }
            } catch (error) {
                console.error('Fetch requests error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [groupId]);

    const handleAction = async (userId, action) => {
        try {
            const res = await api.post(`/groups/${groupId}/${action}/${userId}`);
            if (res.data.success) {
                toast.success(action === 'approve' ? 'Đã duyệt thành viên' : 'Đã từ chối yêu cầu');
                setRequests(prev => prev.filter(r => r.userId !== userId));
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold italic text-blue-600">Yêu cầu tham gia</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 font-medium">
                            <p>Không có yêu cầu nào đang chờ duyệt.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={request.user?.profilePicture || `https://ui-avatars.com/api/?name=${request.user?.firstName}+${request.user?.lastName}`}
                                            className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                            alt=""
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">{request.user?.firstName} {request.user?.lastName}</p>
                                            <p className="text-xs text-gray-500 italic">Yêu cầu tham gia</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAction(request.userId, 'approve')}
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                                            title="Phê duyệt"
                                        >
                                            <div className="flex items-center space-x-1 px-1">
                                                <span className="text-sm font-bold">Duyệt</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleAction(request.userId, 'reject')}
                                            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                            title="Từ chối"
                                        >
                                            <div className="flex items-center space-x-1 px-1">
                                                <span className="text-sm font-bold text-gray-500">Xóa</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberRequestsModal;
