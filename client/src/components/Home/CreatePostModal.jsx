import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import CreatePost from './CreatePost';

const CreatePostModal = ({ isOpen, onClose, initialImage, onPostCreated }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold">Tạo bài viết</h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                <div className="p-4">
                    <CreatePost
                        onPostCreated={() => {
                            if (onPostCreated) onPostCreated();
                            onClose();
                        }}
                        initialImage={initialImage}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
