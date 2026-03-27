import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { PaperAirplaneIcon, FaceSmileIcon, PhotoIcon, MicrophoneIcon, XMarkIcon, ArrowUturnRightIcon } from '@heroicons/react/24/solid';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardTarget, setForwardTarget] = useState(null);
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
    const pathParts = location.pathname.split('/');
    const pathId = pathParts[2] && !isNaN(Number(pathParts[2])) ? pathParts[2] : null;

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
      return;
    }

    // If no state provided, try to parse /messages/:id from pathname
    if (pathId) {
      const fetchTarget = async () => {
        try {
          const res = await api.get(`/users/profile/${pathId}`);
          if (res.data.success && res.data.data && res.data.data.user) {
            const userObj = res.data.data.user;
            const existingConv = conversations.find(c => c.user.id === userObj.id);
            if (existingConv) {
              setSelectedChat(existingConv);
            } else {
              setSelectedChat({ user: userObj });
            }
          }
        } catch (err) {
          console.error('Fetch target user error:', err);
        }
      };
      fetchTarget();
    }
  }, [location.state, conversations]);

  // Derived conversations list including the temporary one if selected and filtering by search term
  const displayConversations = [...conversations]
    .filter(c =>
      `${c.user.firstName} ${c.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (selectedChat?.isTemp && !conversations.find(c => c.user.id === selectedChat.user.id)) {
    if (`${selectedChat.user.firstName} ${selectedChat.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) {
      displayConversations.unshift(selectedChat);
    }
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

    const tempMsgId = Date.now();
    const tempMsg = {
      id: tempMsgId,
      content: messageText,
      senderId: user.id,
      receiverId: selectedChat.user.id,
      createdAt: new Date(),
      isSending: true,
      attachments: filePreviews.map(p => ({
        id: Math.random(),
        fileUrl: p.url,
        fileType: p.type.startsWith('image/') ? 'image' : p.type.startsWith('video/') ? 'video' : p.type.startsWith('audio/') ? 'audio' : 'file',
        fileName: p.name
      }))
    };

    setMessages(prev => [...prev, tempMsg]);
    setIsSending(true);
    const textToSubmit = messageText;

    // Capture files locally before clearing UI state to avoid race
    const filesToSend = [...selectedFiles];

    setMessageText('');
    setSelectedFiles([]);
    setFilePreviews([]);
    setShowEmojiPicker(false);
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedChat.user.id);
      formData.append('content', textToSubmit);
      if (replyingTo && replyingTo.id) {
        formData.append('replyToId', replyingTo.id);
      }

      console.log('Sending files:', filesToSend.map(f => f.name));
      filesToSend.forEach(file => {
        formData.append('files', file);
      });

      // reset replying state after sending
      setReplyingTo(null);

      const res = await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === tempMsgId ? res.data.data : m));
        setIsSending(false);
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
      setMessages(prev => prev.filter(m => m.id !== tempMsgId));
      setIsSending(false);
    }
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
    // focus input
    const input = document.querySelector('input[placeholder="Soạn tin nhắn..."]');
    if (input) input.focus();
  };

  const openForwardModal = (msg) => {
    setForwardTarget(msg);
    setForwardModalOpen(true);
  };

  const handleForwardTo = async (conv) => {
    if (!forwardTarget) return;
    try {
      const res = await api.post('/messages', {
        receiverId: conv.user.id,
        content: forwardTarget.content ? `Fwd: ${forwardTarget.content}` : 'Forwarded message',
        forwardedFromId: forwardTarget.id
      });
      if (res.data.success) {
        setForwardModalOpen(false);
        setForwardTarget(null);
        // If forwarding to current chat, append
        if (conv.user.id === selectedChat.user.id) {
          setMessages(prev => [...prev, res.data.data]);
        }
      }
    } catch (err) {
      console.error('Forward error:', err);
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
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Automatically add to files
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFiles(prev => [...prev, file]);
        setFilePreviews(prev => [...prev, { name: "Voice Message", url: URL.createObjectURL(blob), type: 'audio/webm' }]);
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
    <div className="h-full flex bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-all duration-200">
      {/* Sidebar */}
      <div className="w-1/4 min-w-[300px] border-r dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold dark:text-white">Chat</h1>
            <div className="flex space-x-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                </div>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm trên Messenger"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[15px] font-medium border-none focus:ring-2 focus:ring-facebook-600/50 outline-none transition-all dark:text-white dark:placeholder-gray-400"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {displayConversations.map((conv) => (
            <div
              key={conv.user.id}
              onClick={() => setSelectedChat(conv)}
              className={`flex items-center space-x-3 mx-2 p-3 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group ${selectedChat?.user.id === conv.user.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conv.user.profilePicture || `https://ui-avatars.com/api/?name=${conv.user.firstName}+${conv.user.lastName}`}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm transition-transform group-hover:scale-105"
                />
                {onlineUsers.has(Number(conv.user.id)) && (
                  <div className="absolute right-0.5 bottom-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <h3 className={`font-bold dark:text-white truncate text-[15px] ${selectedChat?.user.id === conv.user.id ? 'text-facebook-600 dark:text-facebook-400' : ''}`}>
                        {conv.user.firstName} {conv.user.lastName}
                    </h3>
                    {conv.lastMessage && (
                        <span className="text-[11px] text-gray-400 text-right ml-2 flex-shrink-0">
                            {moment(conv.lastMessage.createdAt).fromNow(true)}
                        </span>
                    )}
                </div>
                <div className="flex items-center text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                  <p className={`truncate ${conv.lastMessage && !conv.lastMessage?.isRead && conv.lastMessage?.receiverId === user.id ? 'font-bold text-gray-900 dark:text-white' : 'font-medium'}`}>
                    {conv.lastMessage ? (
                      <>
                        {conv.lastMessage.senderId === user.id ? 'Bạn: ' : ''}{conv.lastMessage.content}
                      </>
                    ) : (
                      <span className="italic text-facebook-500">Bắt đầu trò chuyện</span>
                    )}
                  </p>
                </div>
              </div>
              {conv.lastMessage && !conv.lastMessage?.isRead && conv.lastMessage?.receiverId === user.id && (
                  <div className="w-2.5 h-2.5 bg-facebook-600 rounded-full flex-shrink-0 shadow-sm"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${isMediaSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                    <img src={selectedChat.user.profilePicture || `https://ui-avatars.com/api/?name=${selectedChat.user.firstName}+${selectedChat.user.lastName}`} alt="" className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm" />
                    {onlineUsers.has(Number(selectedChat.user.id)) && (
                        <div className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
                    )}
                </div>
                <div>
                  <h3 className="font-bold dark:text-white text-[17px] leading-tight">{selectedChat.user.firstName} {selectedChat.user.lastName}</h3>
                  <p className={`text-[12px] font-bold ${onlineUsers.has(Number(selectedChat.user.id)) ? 'text-green-500' : 'text-gray-500'}`}>
                    {onlineUsers.has(Number(selectedChat.user.id)) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMediaSidebar}
                  className={`p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-facebook-600 transition-all active:scale-95 ${isMediaSidebarOpen ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                  title="Thông tin cuộc hội thoại"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 no-scrollbar transition-colors duration-200">
              <div className="space-y-6 max-w-5xl mx-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.senderId !== user.id && (
                      <img src={selectedChat.user.profilePicture || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full mr-2 self-end" />
                    )}
                    <div className={`max-w-[70%] space-y-2`}>
                      {msg.attachments && msg.attachments.length > 0 && (() => {
                        const count = msg.attachments.length;
                        const wrapperClass = count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : count === 3 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3';
                        return (
                          <div className={`grid gap-1 ${wrapperClass}`}>
                            {msg.attachments.map((att, idx) => (
                              <div
                                key={att.id || idx}
                                className={`relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02] ${count === 3 && idx === 0 ? 'row-span-2' : ''}`}
                              >
                                {att.fileType === 'image' ? (
                                  <img src={att.fileUrl} alt="" className="w-full h-full object-cover" />
                                ) : att.fileType === 'video' ? (
                                  <video src={att.fileUrl} controls className="w-full h-full object-cover" />
                                ) : att.fileType === 'audio' ? (
                                  <div className="p-2 bg-white dark:bg-gray-800">
                                    <audio src={att.fileUrl} controls className="w-full h-10" />
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-100 dark:bg-gray-800 flex items-center space-x-2">
                                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                                    <span className="text-xs truncate">{att.fileName}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                        {/* Quoted reply rendering */}
                        {msg.replyTo && (
                          <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs text-gray-700 dark:text-gray-200 border-l-4 border-facebook-600 shadow-sm">
                            <div className="font-bold text-xs text-facebook-600 dark:text-facebook-400 mb-1">Trả lời</div>
                            <div className="truncate opacity-80">{msg.replyTo.content || (msg.replyTo.attachments && msg.replyTo.attachments[0]?.fileName) || '...'}</div>
                          </div>
                        )}
                      {msg.content && (
                        <div className={`p-3 px-4 rounded-2xl text-[15px] font-medium leading-relaxed shadow-sm transition-all ${msg.senderId === user.id
                          ? 'bg-facebook-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-700'
                          }`}>
                          {msg.content}
                        </div>
                      )}
                      {msg.senderId === user.id && (
                        <div className="flex justify-end pr-1">
                          {msg.isSending ? (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : msg.isRead ? (
                            <img src={selectedChat.user.profilePicture || 'https://via.placeholder.com/40'} alt="" className="w-3 h-3 rounded-full opacity-70" />
                          ) : (
                            <div className="w-3 h-3 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Reply / Forward actions */}
                      <div className="flex items-center space-x-2 mt-1">
                        <button onClick={() => handleReply(msg)} className="text-xs text-gray-500 hover:text-gray-700">Trả lời</button>
                        <button onClick={() => openForwardModal(msg)} className="text-xs text-gray-500 hover:text-gray-700">Chuyển tiếp</button>
                      </div>
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
                <div className="p-4 flex flex-wrap gap-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                  {filePreviews.map((file, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-facebook-600 shadow-md transition-transform hover:scale-105">
                      {file.type.startsWith('image/') ? (
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      ) : file.type.startsWith('audio/') ? (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                          <MicrophoneIcon className="w-8 h-8 text-blue-500" />
                        </div>
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

              {/* Reply preview */}
              {replyingTo && (
                <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <img src={replyingTo.sender?.profilePicture || `https://ui-avatars.com/api/?name=${replyingTo.sender?.firstName}+${replyingTo.sender?.lastName}`} alt="" className="w-10 h-10 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600" />
                    <div className="text-sm">
                      <div className="font-bold text-facebook-600 dark:text-facebook-400 text-xs">Phản hồi {replyingTo.sender ? `${replyingTo.sender.firstName}` : 'bạn'}</div>
                      <div className="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate max-w-md opacity-80">{replyingTo.content || (replyingTo.attachments && replyingTo.attachments[0]?.fileName) || '...'}</div>
                    </div>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-gray-700">Hủy</button>
                </div>
              )}

              {/* Emoji Picker Overlay */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 z-50 p-2">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 flex items-center space-x-3 bg-white dark:bg-gray-900">
                <div className="flex space-x-2 text-facebook-600 dark:text-facebook-400">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <PhotoIcon className="h-6 w-6 cursor-pointer" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    accept="image/*,video/*"
                  />
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <FaceSmileIcon className={`h-6 w-6 cursor-pointer ${showEmojiPicker ? 'text-facebook-800' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={`p-2 rounded-xl transition-all ${isRecording ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' : 'text-facebook-600 dark:text-facebook-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <MicrophoneIcon className="h-6 w-6 cursor-pointer" title="Nhấn giữ để ghi âm" />
                  </button>
                </div>
                <input
                  type="text"
                  value={messageText}
                  onChange={handleTyping}
                  placeholder="Soạn tin nhắn..."
                  className="flex-1 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-facebook-600/50 outline-none text-[15px] font-medium dark:text-white dark:placeholder-gray-400 transition-all"
                />
                <button type="submit" className={`p-2.5 rounded-xl transition-all active:scale-90 ${messageText.trim() || selectedFiles.length > 0 ? 'bg-facebook-600 text-white shadow-md' : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'}`}>
                  <PaperAirplaneIcon className="h-6 w-6" />
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
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md">
            <h2 className="font-bold dark:text-white text-[17px]">Thông tin</h2>
            <button onClick={() => setIsMediaSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
            <img
              src={selectedChat.user.profilePicture || `https://ui-avatars.com/api/?name=${selectedChat.user.firstName}+${selectedChat.user.lastName}`}
              alt=""
              className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-white dark:border-gray-800 shadow-lg transition-transform hover:scale-105"
            />
            <h3 className="font-bold dark:text-white text-xl tracking-tight">{selectedChat.user.firstName} {selectedChat.user.lastName}</h3>
            <div className="flex items-center mt-2 space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full ${onlineUsers.has(Number(selectedChat.user.id)) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-400'}`}></div>
                <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400">
                    {onlineUsers.has(Number(selectedChat.user.id)) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                </p>
            </div>
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

      {/* Forward Modal */}
      {forwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md p-0 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Chuyển tiếp đến</h3>
              <button 
                onClick={() => setForwardModalOpen(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
              >
                  <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-2">
              {displayConversations.map(conv => (
                <div key={conv.user.id} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-between group transition-all">
                  <div className="flex items-center space-x-4">
                    <img src={conv.user.profilePicture || `https://ui-avatars.com/api/?name=${conv.user.firstName}+${conv.user.lastName}`} alt="" className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm transition-transform group-hover:scale-105" />
                    <div className="min-w-0">
                      <div className="font-bold dark:text-white text-[15px] group-hover:text-facebook-600 transition-colors">{conv.user.firstName} {conv.user.lastName}</div>
                      <div className="text-[13px] text-gray-500 dark:text-gray-400 truncate max-w-[200px] font-medium">{conv.lastMessage?.content || ''}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleForwardTo(conv)} 
                    className="px-5 py-2 bg-facebook-600 hover:bg-facebook-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                  >
                        Gửi
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                <button 
                    onClick={() => setForwardModalOpen(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-all"
                >
                    Đóng
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;