import React, { useState } from 'react';
import { XMarkIcon, FlagIcon, MegaphoneIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreatePageModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        website: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    const categories = [
        'Cộng đồng', 'Doanh nghiệp', 'Nghệ sĩ', 'Giải trí', 'Giáo dục', 'Sức khỏe', 'Ẩm thực', 'Mua sắm'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.category) return;

        setLoading(true);
        try {
            const res = await api.post('/pages', formData);
            if (res.data.success) {
                toast.success('Đã tạo Trang thành công!');
                if (onSuccess) onSuccess(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Create page error:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo Trang');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden transition-all duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo Trang</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tên Trang (Bắt buộc)
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nhập tên Trang của bạn"
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Hạng mục (Bắt buộc)
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        >
                            <option value="">Chọn một hạng mục</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tiểu sử / Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Mô tả về Trang của bạn"
                            rows="3"
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                        />
                    </div>

                    <div className="pt-4 space-y-4">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center">
                            <InformationCircleIcon className="h-4 w-4 mr-2" />
                            Thông tin liên hệ (Tùy chọn)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Trang web</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Số điện thoại</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Địa chỉ</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm"
                            />
                        </div>
                    </div>
                </form>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.name.trim() || !formData.category}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Đang tạo...' : 'Tạo Trang'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePageModal;
