import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SaveToCollectionModal = ({ postId, onClose, onSave }) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await api.get('/saved-posts/collections');
                if (res.data.success) {
                    setCollections(res.data.data);
                }
            } catch (error) {
                console.error('Fetch collections error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const handleSaveToCollection = async (collectionName) => {
        setSaving(true);
        try {
            const res = await api.post('/saved-posts', { postId, collectionName });
            if (res.data.success) {
                toast.success('Đã lưu bài viết');
                if (onSave) onSave();
                onClose();
            }
        } catch (error) {
            console.error('Save to collection error:', error);
            toast.error(error.response?.data?.message || 'Không thể lưu bài viết');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateAndSave = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        setSaving(true);
        try {
            // Create collection first
            const createRes = await api.post('/saved-posts/collections', { name: newCollectionName });
            if (createRes.data.success) {
                const collectionId = createRes.data.data.id;
                // Then save post to it
                const saveRes = await api.post('/saved-posts', { postId, collectionId });
                if (saveRes.data.success) {
                    toast.success(`Đã tạo bộ sưu tập và lưu bài viết`);
                    if (onSave) onSave();
                    onClose();
                }
            }
        } catch (error) {
            console.error('Create and save error:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold dark:text-white">Lưu vào bộ sưu tập</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                            <button
                                onClick={() => handleSaveToCollection(null)}
                                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group"
                            >
                                <div className="p-2.5 bg-gray-200 dark:bg-gray-600 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
                                    <FolderIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-bold text-gray-800 dark:text-gray-200 block">Mục đã lưu</span>
                                    <span className="text-xs text-gray-500 font-medium">Bộ sưu tập mặc định</span>
                                </div>
                            </button>

                            {collections.map((col) => (
                                <button
                                    key={col.collectionName}
                                    onClick={() => handleSaveToCollection(col.collectionName)}
                                    className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group"
                                >
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
                                        <FolderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-bold text-gray-800 dark:text-gray-200 block">{col.collectionName}</span>
                                        <span className="text-xs text-gray-500 font-medium">Bộ sưu tập cá nhân</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!showCreateForm ? (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="mt-4 w-full flex items-center justify-center space-x-2 p-3 text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Tạo bộ sưu tập mới</span>
                        </button>
                    ) : (
                        <form onSubmit={handleCreateAndSave} className="mt-4 p-4 border rounded-lg dark:border-gray-700 space-y-4">
                            <input
                                type="text"
                                autoFocus
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="Tên bộ sưu tập"
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !newCollectionName.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {saving ? 'Đang lưu...' : 'Tạo & Lưu'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveToCollectionModal;
