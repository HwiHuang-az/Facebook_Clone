import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ReportModal = ({
    isOpen,
    onClose,
    targetType, // 'post', 'comment', 'user'
    targetId,
    targetName
}) => {
    const [reportType, setReportType] = useState('other');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const reportOptions = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Quấy rối' },
        { value: 'fake_news', label: 'Tin giả' },
        { value: 'violence', label: 'Bạo lực' },
        { value: 'inappropriate_content', label: 'Nội dung không phù hợp' },
        { value: 'other', label: 'Lý do khác' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportType) return;

        try {
            setSubmitting(true);
            const data = {
                reportType,
                description,
                [targetType === 'post' ? 'reportedPostId' : targetType === 'comment' ? 'reportedCommentId' : 'reportedUserId']: targetId
            };

            const res = await api.post('/reports', data);
            if (res.data.success) {
                toast.success('Đã gửi báo cáo thành công. Cảm ơn phản hồi của bạn.');
                onClose();
            }
        } catch (error) {
            console.error('Report submission error:', error);
            toast.error('Không thể gửi báo cáo. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Báo cáo {targetType === 'post' ? 'bài viết' : targetType === 'comment' ? 'bình luận' : 'người dùng'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hãy cho chúng tôi biết tại sao bạn lại báo cáo {targetType === 'post' ? 'bài viết này' : targetType === 'comment' ? 'bình luận này' : `người dùng ${targetName}`}.
                        Phản hồi này giúp chúng tôi giữ môi trường an toàn.
                    </p>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Lý do báo cáo</label>
                        <div className="grid grid-cols-1 gap-2">
                            {reportOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setReportType(opt.value)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-semibold transition-all ${reportType === opt.value
                                            ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {opt.label}
                                    {reportType === opt.value && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Chi tiết bổ sung (không bắt buộc)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Thêm thông tin để giúp chúng tôi hiểu rõ hơn..."
                            className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white min-h-[100px]"
                        />
                    </div>

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
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                        >
                            {submitting ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Gửi báo cáo'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
