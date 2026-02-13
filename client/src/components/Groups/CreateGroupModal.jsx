import React, { useState } from 'react';
import { XMarkIcon, GlobeAsiaAustraliaIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        privacy: 'public'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setLoading(true);
        try {
            const res = await api.post('/groups', formData);
            if (res.data.success) {
                toast.success('Đã tạo nhóm thành công!');
                if (onSuccess) onSuccess(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Create group error:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo nhóm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden transition-all duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo nhóm</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tên nhóm
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nhập tên nhóm của bạn"
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Nhóm của bạn nói về điều gì?"
                            rows="4"
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Chọn quyền riêng tư
                        </label>
                        <div className="space-y-2">
                            <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.privacy === 'public' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    className="hidden"
                                    name="privacy"
                                    value="public"
                                    checked={formData.privacy === 'public'}
                                    onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                                />
                                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                                    <GlobeAsiaAustraliaIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Công khai</p>
                                    <p className="text-xs text-gray-500">Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.privacy === 'public' ? 'border-blue-500' : 'border-gray-300'}`}>
                                    {formData.privacy === 'public' && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                                </div>
                            </label>

                            <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.privacy === 'private' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    className="hidden"
                                    name="privacy"
                                    value="private"
                                    checked={formData.privacy === 'private'}
                                    onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                                />
                                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                                    <LockClosedIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Riêng tư</p>
                                    <p className="text-xs text-gray-500">Chỉ thành viên mới nhìn thấy mọi người trong nhóm và những gì họ đăng.</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.privacy === 'private' ? 'border-blue-500' : 'border-gray-300'}`}>
                                    {formData.privacy === 'private' && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo nhóm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
