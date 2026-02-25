import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const CreateCollectionModal = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setSubmitting(true);
            // Backend handles collection creation as part of saving a post, 
            // but if we want to create an empty collection, we might need a dedicated endpoint
            // or we can just simulate it if the backend doesn't support empty collections yet.
            // Looking at savedPostController, it seems collections are derived from SavedPosts.

            // For now, we'll assume there's a way to create an empty collection or 
            // we'll advise the user to save a post to this new collection.

            // Let's check the controller again... it uses group by collectionName.
            // So to create a collection, we actually need to save a post to it.
            // However, usually UI allows creating one ahead of time.

            // If the backend doesn't have a Create Collection endpoint, I'll add one.

            const res = await api.post('/saved-posts/collections', { name: name.trim() });
            if (res.data.success) {
                toast.success(`Đã tạo bộ sưu tập "${name}"`);
                onCreated();
                onClose();
            }
        } catch (error) {
            console.error('Create collection error:', error);
            toast.error('Không thể tạo bộ sưu tập. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Tạo bộ sưu tập mới</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tên bộ sưu tập</label>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên bộ sưu tập..."
                            className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg text-[15px] bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                            maxLength={50}
                        />
                    </div>

                    <p className="text-xs text-gray-500">
                        Bạn có thể thêm các mục đã lưu vào bộ sưu tập này để dễ dàng tìm kiếm sau này.
                    </p>

                    <div className="flex items-center space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                        >
                            {submitting ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Tạo'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCollectionModal;
