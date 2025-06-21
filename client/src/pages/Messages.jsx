import React, { useState } from 'react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    { id: 1, name: 'Nguyễn Văn A', lastMessage: 'Chào bạn!', time: '10 phút', unread: 2 },
    { id: 2, name: 'Trần Thị B', lastMessage: 'Cảm ơn!', time: '1 giờ', unread: 0 },
  ];

  const messages = selectedChat ? [
    {
      id: 1,
      text: 'Chào bạn!',
      sender: 'other',
      time: '14:30',
      avatar: ''
    },
    {
      id: 2,
      text: 'Chào! Bạn khỏe không?',
      sender: 'me',
      time: '14:32',
      avatar: ''
    },
    {
      id: 3,
      text: 'Mình khỏe, cảm ơn bạn. Bạn thì sao?',
      sender: 'other',
      time: '14:33',
      avatar: ''
    },
    {
      id: 4,
      text: 'Mình cũng ổn. Cuối tuần này có rảnh không?',
      sender: 'me',
      time: '14:35',
      avatar: ''
    }
  ] : [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      // Logic gửi tin nhắn sẽ được thêm sau
      setMessageText('');
    }
  };

  return (
    <div className="h-screen flex bg-white">
      <div className="w-80 border-r border-gray-200">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Đoạn chat</h1>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} onClick={() => setSelectedChat(conv)} 
                 className="p-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-semibold">{conv.name}</h3>
                  <p className="text-sm text-gray-600">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {selectedChat ? (
          <div className="text-center">
            <h2 className="text-xl">Chat với {selectedChat.name}</h2>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl">Chọn một cuộc trò chuyện</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 