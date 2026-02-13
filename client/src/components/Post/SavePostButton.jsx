import React, { useState, useEffect } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SavePostButton = ({ postId, className = "" }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkSavedStatus = async () => {
            try {
                const res = await api.get(`/saved-posts/check/${postId}`);
                if (res.data.success) {
                    setIsSaved(res.data.isSaved);
                }
            } catch (error) {
                console.error('Error checking saved status:', error);
            }
        };

        if (postId) {
            checkSavedStatus();
        }
    }, [postId]);

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);
        try {
            if (isSaved) {
                // Find the saved post ID first or just use the unsave by postId endpoint if it existed
                // Based on controller, unsave uses ID of the SavedPost entry. 
                // But checkSaved returns the data entry too.
                const checkRes = await api.get(`/saved-posts/check/${postId}`);
                if (checkRes.data.success && checkRes.data.data) {
                    const res = await api.delete(`/saved-posts/${checkRes.data.data.id}`);
                    if (res.data.success) {
                        setIsSaved(false);
                        toast.success('Đã gỡ khỏi mục đã lưu');
                    }
                }
            } else {
                const res = await api.post('/saved-posts', { postId });
                if (res.data.success) {
                    setIsSaved(true);
                    toast.success('Đã lưu bài viết');
                }
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái lưu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={isLoading}
            className={`flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${className}`}
            title={isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
        >
            {isSaved ? (
                <BookmarkIconSolid className="h-5 w-5 text-blue-600" />
            ) : (
                <BookmarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
            <span className={`text-sm font-medium ${isSaved ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                {isSaved ? 'Đã lưu' : 'Lưu'}
            </span>
        </button>
    );
};

export default SavePostButton;
