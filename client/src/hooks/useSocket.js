import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);


    useEffect(() => {
        if (user && token) {
            const serverUrl = window.location.origin.includes('3000') 
                ? window.location.origin.replace('3000', '5000')
                : 'http://localhost:5000';

            console.log('🔌 Attempting socket connection to:', serverUrl, 'with token:', !!token);

            const newSocket = io(serverUrl, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on('connect', () => {
                console.log('🔌 Connected to real-time server at', serverUrl);
                // Fetch initial counts
                api.get('/messages/unread').then(res => {
                    if (res.data.success) {
                        setUnreadMessages(res.data.data.messages);
                        setUnreadNotifications(res.data.data.notifications);
                    }
                });
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Socket connection error:', err.message);
            });


            // Listen for system-wide notifications
            newSocket.on('newNotification', (data) => {
                setUnreadNotifications(prev => prev + 1);
                toast(data.message, {
                    icon: '🔔',
                    duration: 4000
                });
            });


            // Listen for incoming messages if not in chat
            newSocket.on('newMessage', (data) => {
                console.log('📨 Hook received newMessage:', data.content.substring(0, 20));
                if (window.location.pathname !== '/messages') {
                    setUnreadMessages(prev => prev + 1);
                    toast(`${data.senderName}: ${data.content.substring(0, 30)}...`, {
                        icon: '💬',
                        duration: 3000
                    });
                }
            });
            
            newSocket.on('initialOnlineUsers', (userIds) => {
                const numericIds = userIds.map(id => Number(id));
                setOnlineUsers(new Set(numericIds));
            });

            newSocket.on('userStatusUpdate', ({ userId, status }) => {
                const numericId = Number(userId);
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    if (status === 'online') newSet.add(numericId);
                    else newSet.delete(numericId);
                    return newSet;
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                console.log('🔌 Disconnected from real-time server');
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ 
            socket, 
            onlineUsers, 
            unreadMessages, 
            unreadNotifications,
            setUnreadMessages,
            setUnreadNotifications
        }}>
            {children}
        </SocketContext.Provider>
    );

};
