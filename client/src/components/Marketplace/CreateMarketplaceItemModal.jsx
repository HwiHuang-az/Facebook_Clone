import React, { useState } from 'react';
import { XMarkIcon, PhotoIcon, MapPinIcon, TagIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateMarketplaceItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        conditionItem: 'new',
        location: '',
        description: '',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const categories = [
        { id: 'vehicles', label: 'Xe cộ' },
        { id: 'rentals', label: 'Căn hộ cho thuê' },
        { id: 'electronics', label: 'Đồ điện tử' },
        { id: 'entertainment', label: 'Giải trí' },
        { id: 'garden', label: 'Gia đình' },
        { id: 'hobbies', label: 'Sở thích' },
    ];

    const conditions = [
        { id: 'new', label: 'Mới' },
        { id: 'used_like_new', label: 'Đã qua sử dụng - Như mới' },
        { id: 'used_good', label: 'Đã qua sử dụng - Tốt' },
        { id: 'used_fair', label: 'Đã qua sử dụng - Khá' },
    ];

    const handleAddImage = () => {
        if (imageUrl.trim()) {
            setFormData({ ...formData, images: [...formData.images, imageUrl] });
            setImageUrl('');
        }
    };

    const removeImage = (index) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.price || !formData.category) return;

        setLoading(true);
        try {
            const res = await api.post('/marketplace', formData);
            if (res.data.success) {
                toast.success('Đã niêm yết mặt hàng!');
                if (onSuccess) onSuccess(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Create marketplace item error:', error);
            toast.error(error.response?.data?.message || 'Không thể niêm yết mặt hàng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden transition-all duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Niêm yết mặt hàng mới</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
                    {/* Left Side - Photos */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Ảnh</label>
                        <div className="grid grid-cols-3 gap-2">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden group">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XMarkIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-2 text-center">
                                <PhotoIcon className="h-8 w-8 text-gray-400 mb-1" />
                                <span className="text-[10px] text-gray-500">Thêm ảnh (tối đa 10)</span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Dán URL ảnh vào đây"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="flex-1 text-xs px-3 py-2 bg-gray-100 border-none rounded-lg focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="text-xs bg-gray-200 px-3 py-2 rounded-lg font-bold"
                            >
                                Thêm
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">* Hiện tại chỉ hỗ trợ URL ảnh. Hãy dán link ảnh từ mạng hoặc ảnh demo.</p>
                    </div>

                    {/* Right Side - Details */}
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                required
                                placeholder="Tiêu đề"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                                <input
                                    type="number"
                                    required
                                    placeholder="Giá"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full pl-8 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-bold"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            >
                                <option value="">Hạng mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                            <select
                                required
                                value={formData.conditionItem}
                                onChange={(e) => setFormData({ ...formData, conditionItem: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            >
                                {conditions.map(cond => (
                                    <option key={cond.id} value={cond.id}>{cond.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Vị trí"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <textarea
                                placeholder="Mô tả"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
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
                        Tiếp tục chỉnh sửa
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.title || !formData.price || !formData.category}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Đang niêm yết...' : 'Đăng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateMarketplaceItemModal;
