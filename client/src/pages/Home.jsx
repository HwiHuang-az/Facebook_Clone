import React from 'react';

const Home = () => {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Stories Section */}
      <div className="bg-white rounded-lg shadow-facebook p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stories</h2>
        <div className="flex space-x-3 overflow-x-auto">
          <div className="flex-shrink-0 w-20 h-32 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg flex items-end justify-center text-white text-sm font-medium cursor-pointer">
            <span className="mb-2">Tạo Story</span>
          </div>
          {/* Placeholder stories */}
          {[1, 2, 3, 4, 5].map((story) => (
            <div key={story} className="flex-shrink-0 w-20 h-32 bg-gray-300 rounded-lg cursor-pointer">
            </div>
          ))}
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-facebook p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Bạn đang nghĩ gì?"
              className="w-full bg-gray-100 rounded-full px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer"
            />
          </div>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
            <span>📹</span>
            <span>Video trực tiếp</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
            <span>📷</span>
            <span>Ảnh/video</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
            <span>😊</span>
            <span>Cảm xúc</span>
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {/* Sample Post */}
        {[1, 2, 3].map((post) => (
          <div key={post} className="bg-white rounded-lg shadow-facebook">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Người dùng {post}</h3>
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
                Đây là một bài đăng mẫu trong Facebook Clone. Hôm nay thật tuyệt vời! 🌟
              </p>
            </div>

            {/* Post Image */}
            <div className="bg-gray-200 h-64"></div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
                <span>👍 100 lượt thích</span>
                <span>10 bình luận • 5 chia sẻ</span>
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
  );
};

export default Home; 