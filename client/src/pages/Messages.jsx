import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { PaperAirplaneIcon, FaceSmileIcon, PhotoIcon, MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import moment from 'moment';
import EmojiPicker from 'emoji-picker-react';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();

  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isMediaSidebarOpen, setIsMediaSidebarOpen] = useState(false);
  const [conversationMedia, setConversationMedia] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        if (res.data.success) setConversations(res.data.data);
      } catch (err) {
        console.error('Fetch conversations error:', err);
      }
    };
    fetchConversations();
  }, []);

  // Handle targetUser from Profile
  useEffect(() => {
    const targetUser = location.state?.targetUser;
    if (targetUser) {
      const existingConv = conversations.find(c => c.user.id === targetUser.id);
      if (existingConv) {
        setSelectedChat(existingConv);
      } else {
        // Create a temporary conversation object for the UI
        const tempConv = {
          user: targetUser,
          lastMessage: null,
          isTemp: true
        };
        setSelectedChat(tempConv);
      }
    }
  }, [location.state, conversations]);

  // Derived conversations list including the temporary one if selected
  const displayConversations = [...conversations];
  if (selectedChat?.isTemp && !conversations.find(c => c.user.id === selectedChat.user.id)) {
    displayConversations.unshift(selectedChat);
  }

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          // If it's a new/temp chat, just clear messages
          if (selectedChat.isTemp) {
            setMessages([]);
            return;
          }
          const res = await api.get(`/messages/${selectedChat.user.id}`);
          if (res.data.success) {
            setMessages(res.data.data);
            scrollToBottom();
          }
        } catch (err) {
          console.error('Fetch messages error:', err);
        }
      };
      fetchMessages();

      // Join room
      if (socket) {
        socket.emit('joinChat', selectedChat.user.id);
      }
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log('📨 Messages page received newMessage:', data);

      // If message is from currently selected chat partner
      // Use loose equality (==) to handle string vs number comparison
      if (selectedChat && (data.senderId == selectedChat.user.id || data.receiverId == selectedChat.user.id)) {
        console.log('✅ Message belongs to current chat');
        // If it was a temp chat and we just sent/received a message, it's no longer temp
        if (selectedChat.isTemp) {
          setSelectedChat(prev => ({ ...prev, isTemp: false }));
        }

        // Prevent duplicate messages in UI (sender already added it)
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
        scrollToBottom();
      } else {
        console.log('ℹ️ Message does not belong to current chat:', selectedChat?.user.id, data.senderId);
      }

      // Re-fetch conversations to update last message
      api.get('/messages/conversations').then(res => {
        if (res.data.success) setConversations(res.data.data);
      });
    };

    const handleTyping = (data) => {
      if (selectedChat && data.userId === selectedChat.user.id) {
        setPartnerTyping(data.isTyping);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('displayTyping', handleTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('displayTyping', handleTyping);
    };
  }, [socket, selectedChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && selectedFiles.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedChat.user.id);
      formData.append('content', messageText);

      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const res = await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        setMessageText('');
        setSelectedFiles([]);
        setFilePreviews([]);
        setShowEmojiPicker(false);
        scrollToBottom();
        socket.emit('typing', { conversationId: selectedChat.user.id, isTyping: false });

        if (selectedChat.isTemp) {
          api.get('/messages/conversations').then(res => {
            if (res.data.success) {
              setConversations(res.data.data);
              const newRealConv = res.data.data.find(c => c.user.id === selectedChat.user.id);
              if (newRealConv) setSelectedChat(newRealConv);
            }
          });
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  const toggleMediaSidebar = async () => {
    if (!isMediaSidebarOpen && selectedChat && !selectedChat.isTemp) {
      try {
        const res = await api.get(`/messages/media/${selectedChat.user.id}`);
        if (res.data.success) setConversationMedia(res.data.data);
      } catch (err) {
        console.error('Fetch media error:', err);
      }
    }
    setIsMediaSidebarOpen(!isMediaSidebarOpen);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        // Automatically send or show preview? Let's show preview but here we just auto-send for simplicity or add to files
        const file = new File([blob], "voice-message.wav", { type: 'audio/wav' });
        setSelectedFiles(prev => [...prev, file]);
        setFilePreviews(prev => [...prev, { name: "Voice Message", url: URL.createObjectURL(blob), type: 'audio/wav' }]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    if (!socket || !selectedChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId: selectedChat.user.id, isTyping: true });
    }

    // Debounce typing end
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { conversationId: selectedChat.user.id, isTyping: false });
    }, 3000);
  };

  return (
    <div className="h-full flex bg-white dark:bg-gray-900 border-t dark:border-gray-800">
      {/* Sidebar */}
      <div className="w-1/4 min-w-[300px] border-r dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b dark:border-gray-800">
          <h1 className="text-2xl font-bold dark:text-white">Chat</h1>
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Tìm kiếm trên Messenger"
              className="w-full p-2 pl-9 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none dark:text-white"
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {displayConversations.map((conv) => (
            <div
              key={conv.user.id}
              onClick={() => setSelectedChat(conv)}
              className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition ${selectedChat?.user.id === conv.user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            >
              <div className="relative">
                <img
                  src={conv.user.profilePicture || 'https://via.placeholder.com/40'}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />
                {onlineUsers.has(Number(conv.user.id)) && (
                  <div className="absolute right-0 bottom-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold dark:text-white truncate">{conv.user.firstName} {conv.user.lastName}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <p className={`truncate ${conv.lastMessage && !conv.lastMessage?.isRead && conv.lastMessage?.receiverId === user.id ? 'font-bold text-gray-900 dark:text-white' : ''}`}>
                    {conv.lastMessage ? (
                      <>
                        {conv.lastMessage.senderId === user.id ? 'Bạn: ' : ''}{conv.lastMessage.content}
                      </>
                    ) : (
                      <span className="italic text-blue-500">Bắt đầu cuộc trò chuyện</span>
                    )}
                  </p>
                  {conv.lastMessage && (
                    <>
                      <span className="mx-1">·</span>
                      <span>{moment(conv.lastMessage.createdAt).fromNow(true)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${isMediaSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <img src={selectedChat.user.profilePicture || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="font-bold dark:text-white">{selectedChat.user.firstName} {selectedChat.user.lastName}</h3>
                  <p className="text-xs text-gray-500">
                    {onlineUsers.has(Number(selectedChat.user.id)) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMediaSidebar}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 transition ${isMediaSidebarOpen ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  title="Thông tin cuộc hội thoại"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 no-scrollbar">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.senderId !== user.id && (
                      <img src={selectedChat.user.profilePicture || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full mr-2 self-end" />
                    )}
                    <div className={`max-w-[70%] space-y-2`}>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`grid gap-1 ${msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {msg.attachments.map(att => (
                            <div key={att.id} className="relative rounded-lg overflow-hidden border dark:border-gray-700">
                              {att.fileType === 'image' ? (
                                <img src={att.fileUrl} alt="" className="w-full h-auto object-cover max-h-60" />
                              ) : att.fileType === 'video' ? (
                                <video src={att.fileUrl} controls className="w-full h-auto max-h-60" />
                              ) : (
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 flex items-center space-x-2">
                                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                                  <span className="text-xs truncate">{att.fileName}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.content && (
                        <div className={`p-3 rounded-2xl text-sm ${msg.senderId === user.id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 dark:text-white rounded-bl-none shadow-sm'
                          }`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {partnerTyping && (
                  <div className="flex justify-start items-center space-x-2">
                    <img src={selectedChat.user.profilePicture || 'https://via.placeholder.com/40'} alt="" className="w-6 h-6 rounded-full" />
                    <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t dark:border-gray-800 relative">
              {/* File Previews */}
              {filePreviews.length > 0 && (
                <div className="p-4 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
                  {filePreviews.map((file, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-500">
                      {file.type.startsWith('image/') ? (
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-gray-900/50 text-white rounded-full p-0.5 hover:bg-gray-900"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Emoji Picker Overlay */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 z-50 p-2">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 flex items-center space-x-3">
                <div className="flex space-x-2 text-blue-600">
                  <button type="button" onClick={() => fileInputRef.current?.click()}>
                    <PhotoIcon className="h-6 w-6 cursor-pointer hover:text-blue-700" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    accept="image/*,video/*"
                  />
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <FaceSmileIcon className={`h-6 w-6 cursor-pointer hover:text-blue-700 ${showEmojiPicker ? 'text-blue-800' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}
                  >
                    <MicrophoneIcon className="h-6 w-6 cursor-pointer hover:text-blue-700" title="Nhấn giữ để ghi âm" />
                  </button>
                </div>
                <input
                  type="text"
                  value={messageText}
                  onChange={handleTyping}
                  placeholder="Soạn tin nhắn..."
                  className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-full focus:outline-none dark:text-white"
                />
                <button type="submit">
                  <PaperAirplaneIcon className={`h-6 w-6 transition ${messageText.trim() || selectedFiles.length > 0 ? 'text-blue-600' : 'text-gray-300'}`} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <PaperAirplaneIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold dark:text-white">Hãy chọn một cuộc trò chuyện</h2>
            <p className="text-sm">Gửi tin nhắn hoặc ảnh cho bạn bè để bắt đầu cuộc hội thoại.</p>
          </div>
        )}
      </div>

      {/* Shared Media Sidebar */}
      {isMediaSidebarOpen && selectedChat && (
        <div className="w-1/4 min-w-[300px] border-l dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
          <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
            <h2 className="font-bold dark:text-white">Thông tin</h2>
            <button onClick={() => setIsMediaSidebarOpen(false)}>
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4 flex flex-col items-center">
            <img
              src={selectedChat.user.profilePicture || 'https://via.placeholder.com/100'}
              alt=""
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            <h3 className="font-bold dark:text-white text-lg">{selectedChat.user.firstName} {selectedChat.user.lastName}</h3>
            <p className="text-sm text-gray-500">Facebook</p>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">File phương tiện đã chia sẻ</h4>
              {conversationMedia.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {conversationMedia.map(att => (
                    <div key={att.id} className="aspect-square rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                      {att.fileType === 'image' ? (
                        <img src={att.fileUrl} alt="" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" title={att.fileName} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4 italic">Chưa có file nào được chia sẻ</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;