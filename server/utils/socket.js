const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSocketMap = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourfacebookclone.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true
    }
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      console.error('❌ Socket auth failed for token:', token.substring(0, 10) + '...', 'Error:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId} (Socket: ${socket.id})`);

    // Add to mapping
    userSocketMap.set(Number(userId), socket.id);
    
    // Join a room for this user to support multiple sessions (tabs)
    socket.join(`user_${userId}`);
    console.log(`🏠 User ${userId} joined room: user_${userId}`);

    // Send current online users to the newly connected user
    socket.emit('initialOnlineUsers', Array.from(userSocketMap.keys()));

    // Online status update (emit to everyone)
    io.emit('userStatusUpdate', { userId: Number(userId), status: 'online' });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId}`);
      userSocketMap.delete(Number(userId));
      io.emit('userStatusUpdate', { userId: Number(userId), status: 'offline' });
    });

    // Custom events
    socket.on('joinChat', (conversationId) => {
      socket.join(`chat_${conversationId}`);
      console.log(`👤 User ${userId} joined chat room: chat_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      // Emit to the partner's room
      console.log(`⌨️ User ${userId} typing status for ${conversationId}: ${isTyping}`);
      io.to(`user_${conversationId}`).emit('displayTyping', { userId: Number(userId), isTyping });
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const getSocketIdByUserId = (userId) => {
  return userSocketMap.get(userId);
};

const sendToUser = (userId, event, data) => {
  if (!io) return false;
  
  console.log(`📤 Sending ${event} to user: ${userId} via room user_${userId}`);
  io.to(`user_${userId}`).emit(event, data);
  return true;
};

module.exports = {
  initSocket,
  getIo,
  getSocketIdByUserId,
  sendToUser,
  userSocketMap
};
