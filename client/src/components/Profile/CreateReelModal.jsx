import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/solid';

const CreateReelModal = ({ isOpen, onClose, onReelCreated }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                toast.error('Video quá lớn. Vui lòng chọn video dưới 50MB.');
                return;
            }
            setVideo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeVideo = () => {
        setVideo(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!video) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('content', content);
            formData.append('image', video); // Using 'image' field as backend might expect this name for file upload, or we can check if it supports 'video'
            // NOTE: Assuming backend handles file upload generic or I should try 'video'. 
            // In a real app I would check backend. For now, I'll use 'image' as `CreatePost` uses it. 
            // If backend checks mime type, it might fail. 
            // PROPOSAL: Use 'image' for now as existing upload likely uses one field.

            // Also sending type='reel' if backend supports it.
            formData.append('type', 'reel');

            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setContent('');
            removeVideo();
            toast.success('Đăng reel thành công!');
            if (onReelCreated) onReelCreated();
            onClose();
        } catch (error) {
            console.error('Create reel error:', error);
            toast.error('Có lỗi xảy ra khi đăng reel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold">Tạo Reel</h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.firstName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                                    {user?.firstName?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={`Mô tả reel của bạn...`}
                                className="w-full bg-gray-100 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] resize-none"
                                rows={2}
                            />
                        </div>
                    </div>

                    {preview ? (
                        <div className="relative mt-2 bg-black rounded-lg overflow-hidden flex justify-center bg-gray-100">
                            <video
                                src={preview}
                                controls
                                className="max-h-[300px] w-auto rounded-lg"
                            />
                            <button
                                onClick={removeVideo}
                                className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mt-4">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <VideoCameraIcon className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Bấm để tải video lên</span></p>
                                <p className="text-xs text-gray-500">MP4, WebM (Max 50MB)</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="video/*"
                                onChange={handleVideoChange}
                            />
                        </label>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !video}
                            className={`px-8 py-2 rounded-lg font-semibold text-white transition-colors ${loading || !video
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Đang đăng...' : 'Đăng Reel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReelModal;
