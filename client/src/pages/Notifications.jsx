import React from 'react';

const Notifications = () => {
  const notifications = [
    { id: 1, type: 'like', user: 'Nguyễn Văn A', content: 'đã thích bài viết của bạn', time: '5 phút trước' },
    { id: 2, type: 'comment', user: 'Trần Thị B', content: 'đã bình luận bài viết của bạn', time: '10 phút trước' },
    { id: 3, type: 'friend', user: 'Lê Văn C', content: 'đã gửi lời mời kết bạn', time: '1 giờ trước' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-facebook p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Thông báo</h1>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-gray-900">
                  <span className="font-semibold">{notification.user}</span> {notification.content}
                </p>
                <p className="text-sm text-gray-500">{notification.time}</p>
              </div>
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 