import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const VideoShareModal = ({ videoUrl, postId, currentTime = 0, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [includeTimestamp, setIncludeTimestamp] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getShareLink = () => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/posts/${postId}`;
        if (includeTimestamp && currentTime > 0) {
            return `${link}?t=${Math.floor(currentTime)}`;
        }
        return link;
    };

    const handleCopyLink = () => {
        const link = getShareLink();
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Đã sao chép liên kết!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareToTimeline = () => {
        // TODO: Implement share to timeline functionality
        toast.success('Đã chia sẻ lên dòng thời gian!');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Chia sẻ video</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Timestamp Option */}
                    {currentTime > 0 && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="includeTimestamp"
                                checked={includeTimestamp}
                                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="includeTimestamp" className="flex-1 text-sm text-gray-700 cursor-pointer">
                                Bắt đầu tại {formatTime(currentTime)}
                            </label>
                        </div>
                    )}

                    {/* Copy Link */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Liên kết</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={getShareLink()}
                                readOnly
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon className="h-5 w-5" />
                                        <span>Đã sao chép</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardDocumentIcon className="h-5 w-5" />
                                        <span>Sao chép</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Share Options */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Chia sẻ tới</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleShareToTimeline}
                                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                            >
                                📝 Dòng thời gian
                            </button>
                            <button
                                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                            >
                                💬 Tin nhắn
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoShareModal;
