import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const PhotoPickerModal = ({ userId, type, onClose, onSelect, onUploadClick }) => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/users/${userId}/photos`);
                if (res.data.success) {
                    setPhotos(res.data.data);
                }
            } catch (error) {
                console.error('Fetch photos error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, [userId]);

    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-[70] flex flex-col p-4 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                <div className="flex justify-between items-center py-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Chọn ảnh {type === 'profile' ? 'đại diện' : 'bìa'}
                    </h2>
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors text-gray-900">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex space-x-4 py-4">
                    <button
                        onClick={onUploadClick}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 border"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5" />
                        <span>Tải ảnh lên</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pt-4">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Ảnh của bạn</h3>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl">
                            Bạn chưa có ảnh nào. Hãy tải ảnh lên trước!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {photos.map((photo, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => onSelect(photo.url)}
                                    className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-4 ring-blue-500 transition-all group relative shadow-sm border"
                                >
                                    <img
                                        src={photo.url}
                                        alt="Past upload"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoPickerModal;
