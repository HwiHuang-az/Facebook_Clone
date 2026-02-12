import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
    PhotoIcon,
    FaceSmileIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
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

            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setContent('');
            removeImage();
            toast.success('Đăng bài thành công!');
            if (onPostCreated) onPostCreated();
        } catch (error) {
            console.error('Create post error:', error);
            toast.error('Có lỗi xảy ra khi đăng bài');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-facebook p-4 mb-4">
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
                        className="w-full bg-gray-100 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] resize-none"
                        rows={2}
                    />

                    {preview && (
                        <div className="relative mt-2">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full max-h-60 object-cover rounded-lg"
                            />
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

            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                <div className="flex space-x-2">
                    <label className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer transition-colors">
                        <PhotoIcon className="h-6 w-6 text-green-500" />
                        <span className="font-medium text-[15px]">Ảnh/Video</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                    <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed opacity-50">
                        <FaceSmileIcon className="h-6 w-6 text-yellow-500" />
                        <span className="font-medium text-[15px]">Cảm giác</span>
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || (!content.trim() && !image)}
                    className={`px-8 py-2 rounded-lg font-semibold text-white transition-colors ${loading || (!content.trim() && !image)
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Đang đăng...' : 'Đăng'}
                </button>
            </div>
        </div>
    );
};

export default CreatePost;
