import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
    PhotoIcon,
    FaceSmileIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

const CreatePost = ({ onPostCreated, initialImage = null, groupId = null, pageId = null }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(initialImage);
    const [preview, setPreview] = useState(initialImage ? URL.createObjectURL(initialImage) : null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const isVideoFile = (file) => {
        return file && file.type.startsWith('video/');
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }
            if (groupId) {
                formData.append('groupId', groupId);
            }
            if (pageId) {
                formData.append('pageId', pageId);
            }

            const res = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setContent('');
            removeImage();
            toast.success('Đăng bài thành công!');
            if (onPostCreated) onPostCreated(res.data.data);
        } catch (error) {
            console.error('Create post error:', error);
            toast.error('Có lỗi xảy ra khi đăng bài');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none p-4 mb-4 border border-gray-100 dark:border-gray-700 font-segoe transition-all duration-200">
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
                        placeholder={`Bạn đang nghĩ gì, ${user?.lastName}?`}
                        className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[40px] resize-none transition-all duration-200 text-[15px] font-medium"
                        rows={2}
                    />

                    {preview && (
                        <div className="relative mt-2">
                            {isVideoFile(image) ? (
                                <video
                                    src={preview}
                                    className="w-full max-h-60 object-cover rounded-lg"
                                    controls
                                />
                            ) : (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full max-h-60 object-cover rounded-lg"
                                />
                            )}
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex space-x-2">
                    <label className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-4 py-2 rounded-xl cursor-pointer transition-all group">
                        <PhotoIcon className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-[15px]">Ảnh/Video</span>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-4 py-2 rounded-xl cursor-not-allowed opacity-50 transition-all">
                        <FaceSmileIcon className="h-6 w-6 text-yellow-500" />
                        <span className="font-bold text-[15px]">Cảm giác</span>
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || (!content.trim() && !image)}
                    className={`px-8 py-2 rounded-xl font-bold text-white transition-all shadow-sm ${loading || (!content.trim() && !image)
                        ? 'bg-blue-300 dark:bg-blue-900/50 cursor-not-allowed text-white/50'
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        }`}
                >
                    {loading ? 'Đang đăng...' : 'Đăng'}
                </button>
            </div>
        </div>
    );
};

export default CreatePost;
