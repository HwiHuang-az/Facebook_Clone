import React, { useState, useRef } from 'react';
import { XMarkIcon, PhotoIcon, CalendarDaysIcon, MapPinIcon, GlobeAmericasIcon, LockClosedIcon, UsersIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const CreateEventModal = ({ onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        privacy: 'public'
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate) {
            toast.error('Vui lòng nhập tên sự kiện và ngày bắt đầu');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('coverPhoto', file);

        try {
            setLoading(true);
            const res = await api.post('/events', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success('Sự kiện của bạn đã được tạo!');
                onCreated();
                onClose();
            }
        } catch (error) {
            console.error('Create event error:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo sự kiện');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold dark:text-white">Tạo sự kiện mới</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Cover Photo Selection */}
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer overflow-hidden group"
                    >
                        {preview ? (
                            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                <PhotoIcon className="h-12 w-12 mb-2" />
                                <span className="font-bold">Thêm ảnh bìa sự kiện</span>
                                <span className="text-sm">Tỷ lệ 16:9 cho kết quả tốt nhất</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tên sự kiện</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Nhập tên sự kiện"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Ngày bắt đầu</label>
                                <div className="relative">
                                    <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Ngày kết thúc (tùy chọn)</label>
                                <div className="relative">
                                    <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Địa điểm</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Thêm địa điểm"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Cho mọi người biết thêm về sự kiện này"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white h-24 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Quyền riêng tư</label>
                            <div className="flex gap-4">
                                {[
                                    { id: 'public', name: 'Công khai', icon: GlobeAmericasIcon },
                                    { id: 'friends', name: 'Bạn bè', icon: UsersIcon },
                                    { id: 'private', name: 'Riêng tư', icon: LockClosedIcon },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, privacy: opt.id }))}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-3 border rounded-xl transition-all ${formData.privacy === opt.id ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-100' : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                                    >
                                        <opt.icon className="h-4 w-4" />
                                        <span className="text-xs font-bold">{opt.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
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
