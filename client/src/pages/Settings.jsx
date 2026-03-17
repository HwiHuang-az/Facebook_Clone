import React, { useState, useEffect } from 'react';
import SettingsSidebar from '../components/Settings/SettingsSidebar';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  BellIcon,
  LanguageIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, changePassword } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [privacySettings, setPrivacySettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Blocking state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  // Notification settings state (localStorage)
  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('fb_notification_settings');
      return stored ? JSON.parse(stored) : {
        pushEnabled: true,
        emailEnabled: true,
        friendRequests: true,
        groupActivity: true,
        pageUpdates: true,
        comments: true,
        tags: true,
        birthdays: true
      };
    } catch {
      return {
        pushEnabled: true,
        emailEnabled: true,
        friendRequests: true,
        groupActivity: true,
        pageUpdates: true,
        comments: true,
        tags: true,
        birthdays: true
      };
    }
  });

  useEffect(() => {
    if (activeSection === 'privacy') {
      fetchPrivacySettings();
      fetchBlockedUsers();
    }
    if (activeSection === 'security') {
      fetchSessions();
    }
  }, [activeSection]);

  // Persist notification settings
  useEffect(() => {
    localStorage.setItem('fb_notification_settings', JSON.stringify(notifSettings));
  }, [notifSettings]);

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

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Đổi mật khẩu thành công!');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Không thể đổi mật khẩu';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleNotif = (field) => {
    setNotifSettings(prev => ({ ...prev, [field]: !prev[field] }));
    toast.success('Đã cập nhật cài đặt thông báo');
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get('/users/settings/sessions');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (error) {
      console.error('Fetch sessions error:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const revokeSession = async (sessionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này?')) return;
    try {
      const res = await api.delete(`/users/settings/sessions/${sessionId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSessions();
      }
    } catch (error) {
      console.error('Revoke session error:', error);
      toast.error('Không thể đăng xuất');
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      setLoadingBlocks(true);
      const res = await api.get('/blocked-users');
      if (res.data.success) {
        setBlockedUsers(res.data.data);
      }
    } catch (error) {
      console.error('Fetch blocked users error:', error);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const unblockUser = async (blockId) => {
    if (!window.confirm('Bạn có chắc chắn muốn bỏ chặn người dùng này?')) return;
    try {
      const res = await api.delete(`/blocked-users/${blockId}`);
      if (res.data.success) {
        toast.success('Đã bỏ chặn');
        fetchBlockedUsers();
      }
    } catch (error) {
      console.error('Unblock error:', error);
      toast.error('Không thể bỏ chặn');
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác?')) return;
    try {
      const res = await api.post('/users/settings/sessions/revoke-others');
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSessions();
      }
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      toast.error('Không thể đăng xuất khỏi các thiết bị khác');
    }
  };

  const formatDeviceInfo = (deviceInfo) => {
    if (!deviceInfo) return 'Thiết bị không xác định';
    const { platform, userAgent } = deviceInfo;
    
    let deviceName = platform || 'Thiết bị';
    if (userAgent.includes('Windows')) deviceName = 'Windows PC';
    else if (userAgent.includes('Macintosh')) deviceName = 'Mac';
    else if (userAgent.includes('iPhone')) deviceName = 'iPhone';
    else if (userAgent.includes('Android')) deviceName = 'Điện thoại Android';

    let browserName = 'Trình duyệt';
    if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';

    return `${deviceName} • ${browserName}`;
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

  const NotifToggle = ({ label, description, field, value }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition border dark:border-gray-700">
      <div className="flex-1 pr-4">
        <p className="font-bold dark:text-white text-[15px]">{label}</p>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => toggleNotif(field)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
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
                    <span className="text-gray-900 dark:text-white font-medium">
                      {user ? `${user.firstName} ${user.lastName}` : '...'}
                    </span>
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">Chỉnh sửa</button>
                  </div>
                </section>
                <section>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thông tin liên hệ</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {user?.email || '...'}
                      </span>
                      <span className="text-xs text-gray-500">Email chính</span>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">Chỉnh sửa</button>
                  </div>
                </section>
                {user?.gender && (
                  <section>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Giới tính</label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                      </span>
                    </div>
                  </section>
                )}
                {user?.dateOfBirth && (
                  <section>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ngày sinh</label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white mb-2">Mật khẩu và bảo mật</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Bạn nên sử dụng mật khẩu mạnh mà mình chưa sử dụng ở đâu khác</p>

              {passwordSuccess && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mb-6 animate-in fade-in duration-300">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <p className="text-green-700 dark:text-green-400 font-semibold text-sm">Đổi mật khẩu thành công!</p>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.current ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.new ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordForm.newPassword && passwordForm.newPassword.length < 6 && (
                    <p className="text-xs text-red-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.confirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        <span>Đang đổi...</span>
                      </span>
                    ) : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>

              <div className="mt-10 pt-10 border-t dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold dark:text-white">Nơi bạn đã đăng nhập</h3>
                  {sessions.length > 1 && (
                    <button 
                      onClick={revokeAllOtherSessions}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Đăng xuất khỏi tất cả các phiên khác
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {loadingSessions ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Chưa có thông tin phiên đăng nhập</p>
                  ) : (
                    sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <ShieldCheckIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div>
                            <p className="font-bold text-[15px] dark:text-white">
                              {formatDeviceInfo(session.deviceInfo)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {session.ipAddress} • {new Date(session.createdAt).toLocaleString('vi-VN')}
                              {session.sessionToken === localStorage.getItem('fb_clone_token') && (
                                <span className="ml-2 text-green-600 font-bold">• Phiên hiện tại</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {session.sessionToken !== localStorage.getItem('fb_clone_token') && (
                          <button 
                            type="button"
                            onClick={() => revokeSession(session.id)}
                            className="text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-lg transition"
                          >
                            Đăng xuất
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white mb-2">Cài đặt thông báo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Quản lý cách bạn nhận thông báo</p>

              <div className="space-y-4">
                <div className="pt-2 pb-2">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Kênh thông báo</h3>
                  <div className="space-y-3">
                    <NotifToggle
                      label="Thông báo đẩy"
                      description="Nhận thông báo trực tiếp trên trình duyệt"
                      field="pushEnabled"
                      value={notifSettings.pushEnabled}
                    />
                    <NotifToggle
                      label="Thông báo qua email"
                      description="Nhận thông báo qua địa chỉ email của bạn"
                      field="emailEnabled"
                      value={notifSettings.emailEnabled}
                    />
                  </div>
                </div>

                <div className="pt-4 pb-2 border-t dark:border-gray-700">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Loại thông báo</h3>
                  <div className="space-y-3">
                    <NotifToggle
                      label="Lời mời kết bạn"
                      description="Khi ai đó gửi lời mời kết bạn cho bạn"
                      field="friendRequests"
                      value={notifSettings.friendRequests}
                    />
                    <NotifToggle
                      label="Hoạt động nhóm"
                      description="Bài viết mới, bình luận trong nhóm của bạn"
                      field="groupActivity"
                      value={notifSettings.groupActivity}
                    />
                    <NotifToggle
                      label="Cập nhật Trang"
                      description="Thông báo từ các Trang bạn theo dõi"
                      field="pageUpdates"
                      value={notifSettings.pageUpdates}
                    />
                    <NotifToggle
                      label="Bình luận"
                      description="Khi ai đó bình luận bài viết của bạn"
                      field="comments"
                      value={notifSettings.comments}
                    />
                    <NotifToggle
                      label="Gắn thẻ"
                      description="Khi ai đó gắn thẻ bạn trong bài viết hoặc ảnh"
                      field="tags"
                      value={notifSettings.tags}
                    />
                    <NotifToggle
                      label="Sinh nhật"
                      description="Nhắc nhở sinh nhật bạn bè"
                      field="birthdays"
                      value={notifSettings.birthdays}
                    />
                  </div>
                </div>
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

                <div className="mt-10 pt-10 border-t dark:border-gray-700">
                  <h3 className="text-lg font-bold dark:text-white mb-4 font-segoe">Người dùng đã chặn</h3>
                  <p className="text-sm text-gray-500 mb-6 font-segoe">
                    Khi bạn chặn một người nào đó, họ sẽ không thể xem nội dung bạn đăng lên dòng thời gian, gắn thẻ bạn, mời bạn tham gia sự kiện hoặc nhóm, bắt đầu cuộc trò chuyện với bạn hay thêm bạn làm bạn bè.
                  </p>

                  <div className="space-y-4">
                    {loadingBlocks ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : blockedUsers.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed dark:border-gray-700">
                        <ShieldCheckIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500 italic font-segoe">Bạn chưa chặn ai cả.</p>
                      </div>
                    ) : (
                      blockedUsers.map((block) => (
                        <div key={block.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={block.blocked?.profilePicture || 'https://via.placeholder.com/40'} 
                              className="w-10 h-10 rounded-full object-cover"
                              alt="" 
                            />
                            <span className="font-bold dark:text-white font-segoe">
                              {block.blocked?.firstName} {block.blocked?.lastName}
                            </span>
                          </div>
                          <button 
                            onClick={() => unblockUser(block.id)}
                            className="text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-lg transition font-segoe"
                          >
                            Bỏ chặn
                          </button>
                        </div>
                      ))
                    )}
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
