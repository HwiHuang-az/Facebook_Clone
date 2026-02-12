import React, { useState, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const CreateStoryModal = ({ onClose, onCreated }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file && !content.trim()) return;

        const formData = new FormData();
        if (file) formData.append('image', file);
        if (content) formData.append('content', content);

        try {
            setLoading(true);
            const res = await api.post('/stories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success('Đã thêm vào tin của bạn');
                onCreated();
                onClose();
            }
        } catch (error) {
            console.error('Create story error:', error);
            toast.error('Không thể tạo tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-[80] flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-2xl font-bold">Tạo tin</h2>
                <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors text-xl font-bold">✕</button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row bg-gray-100 overflow-hidden">
                {/* Left Sidebar - Design */}
                <div className="w-full md:w-80 bg-white p-4 shadow-lg z-10 space-y-6">
                    <div className="flex items-center space-x-3 p-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">⚙️</div>
                        <span className="font-semibold">Cài đặt tin</span>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-bold text-gray-700">Văn bản (tùy chọn)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập nội dung tin..."
                            className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-32"
                        />
                    </div>

                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 border-2 border-dashed border-blue-200"
                    >
                        <span>🖼️</span>
                        <span>{file ? 'Đổi ảnh/video' : 'Chọn ảnh/video'}</span>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*"
                    />

                    <div className="pt-10">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!file && !content.trim())}
                            className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${loading || (!file && !content.trim())
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                }`}
                        >
                            {loading ? 'Đang chia sẻ...' : 'Chia sẻ lên tin'}
                        </button>
                    </div>
                </div>

                {/* Right - Preview Area */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                    <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-3xl shadow-2xl overflow-hidden relative group">
                        {!preview && !content ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-4">
                                <div className="text-6xl">✨</div>
                                <p className="font-medium">Xem trước tin của bạn</p>
                            </div>
                        ) : (
                            <>
                                {preview && (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                )}
                                {content && (
                                    <div className={`absolute inset-0 flex items-center justify-center p-6 text-center text-2xl font-bold text-white drop-shadow-lg ${!preview ? 'bg-gradient-to-br from-pink-500 to-orange-400' : 'bg-black bg-opacity-20'}`}>
                                        {content}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStoryModal;
