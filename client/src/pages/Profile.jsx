import React from 'react';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Photo */}
      <div className="bg-white rounded-lg shadow-facebook overflow-hidden mb-4">
        <div className="h-96 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          <div className="absolute bottom-4 left-4 flex items-end space-x-4">
            <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white"></div>
            <div className="text-white mb-4">
              <h1 className="text-3xl font-bold">Tên người dùng</h1>
              <p className="text-lg opacity-90">1,234 bạn bè</p>
            </div>
          </div>
        </div>
        
        {/* Profile Actions */}
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
              + Thêm vào tin
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">
              ✏️ Chỉnh sửa trang cá nhân
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="px-4">
          <div className="flex space-x-8 text-gray-600">
            <button className="py-4 border-b-2 border-blue-600 text-blue-600 font-semibold">
              Bài viết
            </button>
            <button className="py-4 hover:bg-gray-100 px-2">
              Giới thiệu
            </button>
            <button className="py-4 hover:bg-gray-100 px-2">
              Bạn bè
            </button>
            <button className="py-4 hover:bg-gray-100 px-2">
              Ảnh
            </button>
            <button className="py-4 hover:bg-gray-100 px-2">
              Video
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Intro */}
          <div className="bg-white rounded-lg shadow-facebook p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Giới thiệu</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center space-x-3">
                <span>🏢</span>
                <span>Làm việc tại Công ty ABC</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>🎓</span>
                <span>Học tại Đại học XYZ</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>📍</span>
                <span>Sống tại Hà Nội</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>💞</span>
                <span>Độc thân</span>
              </div>
            </div>
            <button className="w-full mt-3 text-blue-600 hover:bg-gray-100 py-2 rounded-lg">
              Chỉnh sửa chi tiết
            </button>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-facebook p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Ảnh</h3>
              <button className="text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((photo) => (
                <div key={photo} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Friends */}
          <div className="bg-white rounded-lg shadow-facebook p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Bạn bè</h3>
              <button className="text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <p className="text-gray-600 text-sm mb-3">1,234 bạn bè</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((friend) => (
                <div key={friend} className="text-center">
                  <div className="w-full aspect-square bg-gray-200 rounded-lg mb-1"></div>
                  <p className="text-xs text-gray-900">Bạn {friend}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow-facebook p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <input
                type="text"
                placeholder="Bạn đang nghĩ gì?"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {[1, 2, 3].map((post) => (
              <div key={post} className="bg-white rounded-lg shadow-facebook">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Tên người dùng</h3>
                      <p className="text-sm text-gray-500">2 giờ trước</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full">
                    <span>⋯</span>
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-gray-900">
                    Bài đăng #{post} trên trang cá nhân của tôi! 🌟
                  </p>
                </div>

                {/* Post Image */}
                <div className="bg-gray-200 h-64"></div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
                    <span>👍 {Math.floor(Math.random() * 100)} lượt thích</span>
                    <span>{Math.floor(Math.random() * 20)} bình luận • {Math.floor(Math.random() * 10)} chia sẻ</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center">
                      <span>👍</span>
                      <span>Thích</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center">
                      <span>💬</span>
                      <span>Bình luận</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center">
                      <span>↗️</span>
                      <span>Chia sẻ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 