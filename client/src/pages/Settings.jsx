import React, { useState, useEffect } from 'react';
import SettingsSidebar from '../components/Settings/SettingsSidebar';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  BellIcon,
  LanguageIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [privacySettings, setPrivacySettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeSection === 'privacy') {
      fetchPrivacySettings();
    }
  }, [activeSection]);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/privacy');
      if (res.data.success) {
        setPrivacySettings(res.data.data);
      }
    } catch (error) {
      console.error('Fetch privacy settings error:', error);
      toast.error('Không thể tải cài đặt quyền riêng tư');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacy = async (field, value) => {
    try {
      setSaving(true);
      const res = await api.put('/privacy', { [field]: value });
      if (res.data.success) {
        setPrivacySettings(res.data.data);
        toast.success('Đã cập nhật cài đặt');
      }
    } catch (error) {
      console.error('Update privacy error:', error);
      toast.error('Không thể cập nhật cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const resetPrivacy = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt quyền riêng tư về mặc định?')) return;
    try {
      setSaving(true);
      const res = await api.post('/privacy/reset');
      if (res.data.success) {
        setPrivacySettings(res.data.data);
        toast.success('Đã đặt lại cài đặt về mặc định');
      }
    } catch (error) {
      console.error('Reset privacy error:', error);
      toast.error('Không thể đặt lại cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const PrivacyToggle = ({ label, description, field, value }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition border dark:border-gray-700">
      <div className="flex-1 pr-4">
        <p className="font-bold dark:text-white text-[15px]">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => updatePrivacy(field, !value)}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const PrivacySelect = ({ label, description, field, value, options }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition border dark:border-gray-700 gap-4">
      <div className="flex-1">
        <p className="font-bold dark:text-white text-[15px]">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => updatePrivacy(field, e.target.value)}
        disabled={saving}
        className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const visibilityOptions = [
    { value: 'public', label: 'Công khai' },
    { value: 'friends', label: 'Bạn bè' },
    { value: 'only_me', label: 'Chỉ mình tôi' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white mb-6">Cài đặt tài khoản</h2>
              <div className="space-y-4">
                <section>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tên hiển thị</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white font-medium">Nguyễn Văn A</span>
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">Chỉnh sửa</button>
                  </div>
                </section>
                <section>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thông tin liên hệ</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-medium">email@example.com</span>
                      <span className="text-xs text-gray-500">Email chính</span>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">Chỉnh sửa</button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white mb-6">Mật khẩu và bảo mật</h2>
              <div className="space-y-4">
                <button className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border dark:border-gray-700 transition flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
                      <ShieldCheckIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                    </div>
                    <div>
                      <p className="font-bold dark:text-white">Đổi mật khẩu</p>
                      <p className="text-sm text-gray-500">Bạn nên sử dụng mật khẩu mạnh mà mình chưa sử dụng ở đâu khác</p>
                    </div>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition">Thay đổi</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        if (loading) return (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
        if (!privacySettings) return (
          <div className="text-center py-20 text-gray-500">Không tìm thấy cài đặt quyền riêng tư</div>
        );
        return (
          <div className="space-y-6 pb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Quyền riêng tư</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý ai có thể xem và tương tác với bạn</p>
                </div>
                <button
                  onClick={resetPrivacy}
                  className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Đặt lại mặc định</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="pt-2 pb-2">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Tương tác và Kết nối</h3>
                  <div className="space-y-3">
                    <PrivacySelect
                      label="Ai có thể gửi lời mời kết bạn?"
                      description="Kiểm soát đối tượng có thể gửi lời mời kết bạn cho bạn."
                      field="whoCanSendFriendRequests"
                      value={privacySettings.whoCanSendFriendRequests}
                      options={[
                        { value: 'everyone', label: 'Mọi người' },
                        { value: 'friends_of_friends', label: 'Bạn của bạn bè' }
                      ]}
                    />
                    <PrivacySelect
                      label="Ai có thể nhắn tin cho bạn?"
                      description="Giới hạn người có thể bắt đầu cuộc trò chuyện mới."
                      field="whoCanMessageMe"
                      value={privacySettings.whoCanMessageMe}
                      options={[
                        { value: 'everyone', label: 'Mọi người' },
                        { value: 'friends', label: 'Bạn bè' }
                      ]}
                    />
                  </div>
                </div>

                <div className="pt-4 pb-2 border-t dark:border-gray-700">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Hoạt động và Hiển thị</h3>
                  <div className="space-y-3">
                    <PrivacySelect
                      label="Đối tượng mặc định cho bài viết"
                      description="Tất cả bài viết mới sẽ sử dụng đối tượng này trừ khi bạn thay đổi."
                      field="postDefaultPrivacy"
                      value={privacySettings.postDefaultPrivacy}
                      options={visibilityOptions}
                    />
                    <PrivacySelect
                      label="Quyền riêng tư của tin (Story)"
                      description="Ai có thể xem tin của bạn trong vòng 24 giờ."
                      field="storyPrivacy"
                      value={privacySettings.storyPrivacy}
                      options={visibilityOptions}
                    />
                    <PrivacyToggle
                      label="Trạng thái hoạt động"
                      description="Cho phép bạn bè biết khi nào bạn đang trực tuyến."
                      field="activityStatusVisible"
                      value={privacySettings.activityStatusVisible}
                    />
                    <PrivacyToggle
                      label="Thông báo đã đọc"
                      description="Cho người khác biết khi bạn đã xem tin nhắn của họ."
                      field="readReceiptsEnabled"
                      value={privacySettings.readReceiptsEnabled}
                    />
                  </div>
                </div>

                <div className="pt-4 pb-2 border-t dark:border-gray-700">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Dòng thời gian và Gắn thẻ</h3>
                  <div className="space-y-3">
                    <PrivacySelect
                      label="Ai có thể đăng lên dòng thời gian của bạn?"
                      field="whoCanPostOnTimeline"
                      value={privacySettings.whoCanPostOnTimeline}
                      options={[
                        { value: 'friends', label: 'Bạn bè' },
                        { value: 'only_me', label: 'Chỉ mình tôi' }
                      ]}
                    />
                    <PrivacySelect
                      label="Ai có thể xem nội dung người khác đăng lên dòng thời gian của bạn?"
                      field="whoCanSeePostsOnTimeline"
                      value={privacySettings.whoCanSeePostsOnTimeline}
                      options={visibilityOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 italic">Tính năng này đang được phát triển</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden font-segoe">
      {/* Sidebar */}
      <div className="hidden lg:block w-90 flex-shrink-0 border-r bg-white dark:bg-gray-800 h-full sticky top-0">
        <SettingsSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-bold dark:text-white">Cài đặt</h1>
          </div>

          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
