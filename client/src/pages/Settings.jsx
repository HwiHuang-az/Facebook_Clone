import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-facebook p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>
        
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tài khoản</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                <span className="font-medium">Thông tin cá nhân</span>
                <p className="text-sm text-gray-600">Quản lý tên, email và thông tin cá nhân</p>
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                <span className="font-medium">Mật khẩu và bảo mật</span>
                <p className="text-sm text-gray-600">Đổi mật khẩu và cài đặt bảo mật</p>
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quyền riêng tư</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                <span className="font-medium">Ai có thể xem bài viết của bạn</span>
                <p className="text-sm text-gray-600">Kiểm soát đối tượng xem được bài viết</p>
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                <span className="font-medium">Ai có thể liên hệ với bạn</span>
                <p className="text-sm text-gray-600">Quản lý lời mời kết bạn và tin nhắn</p>
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Khác</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                <span className="font-medium">Ngôn ngữ</span>
                <p className="text-sm text-gray-600">Chọn ngôn ngữ hiển thị</p>
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg text-red-600">
                <span className="font-medium">Đăng xuất</span>
                <p className="text-sm">Đăng xuất khỏi tài khoản</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 