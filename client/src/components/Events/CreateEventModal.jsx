import React, { useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';

const CreateEventModal = ({ isOpen, onClose, groupId, pageId, onEventCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        privacy: 'public'
    });
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate) {
            return toast.error('Vui lòng điền tên và thời gian bắt đầu');
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (coverPhoto) data.append('coverPhoto', coverPhoto);
        if (groupId) data.append('groupId', groupId);
        if (pageId) data.append('pageId', pageId);

        try {
            setLoading(true);
            const res = await api.post('/events', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success('Tạo sự kiện thành công');
                onEventCreated(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Create event error:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo sự kiện');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Tạo sự kiện mới</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4">
                    <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 group hover:border-blue-400 transition cursor-pointer">
                        {previewUrl ? (
                            <img src={previewUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500">
                                <CameraIcon className="w-10 h-10 mb-2" />
                                <span className="font-semibold">Thêm ảnh bìa sự kiện</span>
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Tên sự kiện</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tên sự kiện của bạn"
                            className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Thời gian bắt đầu</label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Thời gian kết thúc</label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Địa điểm</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Địa điểm hoặc link trực tuyến"
                            className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả cho sự kiện của bạn"
                            rows="3"
                            className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Quyền riêng tư</label>
                        <select
                            name="privacy"
                            value={formData.privacy}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="public">Công khai</option>
                            <option value="private">Riêng tư</option>
                        </select>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
