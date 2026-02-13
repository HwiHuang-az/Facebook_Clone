import React, { useState, useEffect } from 'react';
import {
    LockClosedIcon,
    GlobeAmericasIcon,
    UsersIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const PrivacySettingsPage = () => {
    const [settings, setSettings] = useState({
        postVisibility: 'public',
        friendRequestPrivacy: 'everyone',
        friendListVisibility: 'everyone',
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/privacy');
            if (res.data.success) {
                // Merge default with API results to ensure all keys exist
                setSettings(prev => ({ ...prev, ...res.data.data }));
            }
        } catch (error) {
            console.error('Error fetching privacy settings:', error);
            toast.error('Không thể tải cài đặt quyền riêng tư');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSetting = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        try {
            setSaving(true);
            const res = await api.put('/privacy', newSettings);
            if (res.data.success) {
                toast.success('Đã cập nhật cài đặt');
            }
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            toast.error('Cập nhật thất bại');
            // Revert on error
            fetchSettings();
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Bạn có chắc muốn khôi phục cài đặt gốc?')) return;

        try {
            setSaving(true);
            const res = await api.post('/privacy/reset');
            if (res.data.success) {
                setSettings(res.data.data);
                toast.success('Đã khôi phục cài đặt');
            }
        } catch (error) {
            console.error('Error resetting privacy settings:', error);
            toast.error('Khôi phục thất bại');
        } finally {
            setSaving(false);
        }
    };

    const SettingRow = ({ icon: Icon, title, description, current, options, onSelect }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <select
                        value={current}
                        onChange={(e) => onSelect(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border-none rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 py-2 px-3 min-w-[140px]"
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-32 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Đang tải cài đặt...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                            <ShieldCheckIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cài đặt Quyền riêng tư</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Kiểm soát ai có thể xem và tương tác với bài viết của bạn</p>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        disabled={saving}
                        className="flex items-center space-x-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                        <span>Khôi phục gốc</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-1 uppercase tracking-wider text-[11px]">Hoạt động của bạn</h2>
                    <SettingRow
                        icon={GlobeAmericasIcon}
                        title="Ai có thể xem bài viết của bạn?"
                        description="Điều này áp dụng cho các bài viết trong tương lai của bạn."
                        current={settings.postVisibility}
                        options={[
                            { label: 'Công khai', value: 'public' },
                            { label: 'Bạn bè', value: 'friends' },
                            { label: 'Chỉ mình tôi', value: 'private' }
                        ]}
                        onSelect={(val) => handleUpdateSetting('postVisibility', val)}
                    />

                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-1 mt-8 uppercase tracking-wider text-[11px]">Cách mọi người tìm thấy bạn</h2>
                    <SettingRow
                        icon={UsersIcon}
                        title="Ai có thể gửi kết bạn?"
                        description="Hạn chế những người có thể gửi lời mời kết bạn cho bạn."
                        current={settings.friendRequestPrivacy}
                        options={[
                            { label: 'Mọi người', value: 'everyone' },
                            { label: 'Bạn của bạn bè', value: 'friends_of_friends' }
                        ]}
                        onSelect={(val) => handleUpdateSetting('friendRequestPrivacy', val)}
                    />

                    <SettingRow
                        icon={ListBulletIcon}
                        title="Ai có thể xem danh sách bạn bè?"
                        description="Kiểm soát khả năng hiển thị danh sách bạn bè trên trang cá nhân."
                        current={settings.friendListVisibility}
                        options={[
                            { label: 'Mọi người', value: 'everyone' },
                            { label: 'Bạn bè', value: 'friends' },
                            { label: 'Chỉ mình tôi', value: 'private' }
                        ]}
                        onSelect={(val) => handleUpdateSetting('friendListVisibility', val)}
                    />

                    <SettingRow
                        icon={LockClosedIcon}
                        title="Khả năng hiển thị trang cá nhân"
                        description="Đặt mức độ riêng tư tổng thể cho trang cá nhân của bạn."
                        current={settings.profileVisibility}
                        options={[
                            { label: 'Công khai', value: 'public' },
                            { label: 'Bạn bè', value: 'friends' },
                            { label: 'Chỉ mình tôi', value: 'private' }
                        ]}
                        onSelect={(val) => handleUpdateSetting('profileVisibility', val)}
                    />
                </div>

                <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100">Kiểm tra quyền riêng tư</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Hướng dẫn nhanh cách thiết lập quyền riêng tư an toàn nhất cho bạn.</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all ml-auto">Bắt đầu</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettingsPage;
