import React, { useState } from 'react';
import { 
    XMarkIcon, 
    ShareIcon, 
    FlagIcon, 
    ChatBubbleOvalLeftIcon,
    MapPinIcon,
    CalendarIcon,
    UserIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const MarketplaceItemDetailModal = ({ item, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();

    if (!item) return null;

    const handleMessageSeller = () => {
        if (item.seller) {
            navigate(`/messages/${item.seller.id}`, { state: { targetUser: item.seller } });
            onClose();
        }
    };

    const nextImage = () => {
        if (item.images && item.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
        }
    };

    const prevImage = () => {
        if (item.images && item.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-70 flex items-center justify-center p-0 md:p-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 w-full max-w-6xl h-full md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Close Button (Mobile) */}
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-2 bg-gray-900/50 text-white rounded-full hover:bg-gray-900 transition md:hidden"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Left Side: Images */}
                <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative group">
                    {item.images && item.images.length > 0 ? (
                        <>
                            <img 
                                src={item.images[currentImageIndex]} 
                                alt={item.title}
                                className="max-w-full max-h-full object-contain"
                            />
                            
                            {item.images.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-4 p-2 bg-gray-900/40 text-white rounded-full hover:bg-gray-900/60 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeftIcon className="h-6 w-6" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-4 p-2 bg-gray-900/40 text-white rounded-full hover:bg-gray-900/60 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRightIcon className="h-6 w-6" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                                        {item.images.map((_, idx) => (
                                            <div 
                                                key={idx}
                                                className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-9xl">📦</div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-1/3 flex flex-col h-full bg-white dark:bg-gray-800 border-l dark:border-gray-700 overflow-y-auto">
                    {/* Header */}
                    <div className="p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-center">
                        <h2 className="text-xl font-bold dark:text-white truncate pr-8" title={item.title}>{item.title}</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition hidden md:block"
                        >
                            <XMarkIcon className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Price & Title */}
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                            </p>
                            <h1 className="text-lg font-medium text-gray-800 dark:text-gray-200">{item.title}</h1>
                            <p className="text-sm text-gray-500 mt-1">Được niêm yết {moment(item.createdAt).fromNow()} tại {item.location}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <button 
                                onClick={handleMessageSeller}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center space-x-2 transition"
                            >
                                <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                                <span>Nhắn tin</span>
                            </button>
                            <button className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition">
                                <ShareIcon className="h-5 w-5" />
                            </button>
                            <button className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition">
                                <FlagIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Chi tiết</h3>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div className="text-gray-500">Tình trạng</div>
                                <div className="text-gray-900 dark:text-gray-200 font-medium">{item.conditionItem === 'new' ? 'Mới' : 'Đã qua sử dụng'}</div>
                                
                                <div className="text-gray-500">Hạng mục</div>
                                <div className="text-gray-900 dark:text-gray-200 font-medium capitalize">{item.category}</div>
                            </div>
                            <p className="mt-4 text-gray-800 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Vị trí niêm yết</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPinIcon className="h-5 w-5" />
                                <span>{item.location} · Bản đồ được bảo mật</span>
                            </div>
                            <div className="mt-3 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <MapPinIcon className="h-8 w-8 text-red-500" />
                                </div>
                                {/* Placeholder for map */}
                                <img src="https://via.placeholder.com/400x200?text=Map+Placeholder" alt="Map" className="w-full h-full object-cover opacity-50" />
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="pt-6 border-t dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Thông tin người bán</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${item.seller?.id}`)}>
                                    <img 
                                        src={item.seller?.profilePicture || 'https://via.placeholder.com/50'} 
                                        alt="" 
                                        className="w-12 h-12 rounded-full border dark:border-gray-600" 
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white hover:underline">
                                            {item.seller ? `${item.seller.firstName} ${item.seller.lastName}` : 'Người dùng Facebook'}
                                        </p>
                                        <p className="text-xs text-gray-500">Tham gia Facebook từ {item.seller ? moment(item.seller.createdAt).year() : '...'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceItemDetailModal;
