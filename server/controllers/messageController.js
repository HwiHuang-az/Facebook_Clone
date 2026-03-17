const { Message, User, MessageAttachment, sequelize, PrivacySetting, Friendship } = require('../models');
const { Op } = require('sequelize');
const { sendToUser } = require('../utils/socket');

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // This is a complex query to get latest message for each partner
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      },
      attributes: [
        'id', 'content', 'createdAt', 'isRead', 'senderId', 'receiverId',
        [
          sequelize.literal(`
            CASE 
              WHEN sender_id = ${userId} THEN receiver_id 
              ELSE sender_id 
            END
          `), 
          'partnerId'
        ]
      ],
      order: [['createdAt', 'DESC']],
      // In a real app, you'd group by partnerId and take the max(id)
    });

    // Simple grouping in JS for now (Facebook-like)
    const partners = new Map();
    for (const msg of conversations) {
      const partnerId = msg.get('partnerId');
      if (!partners.has(partnerId)) {
        partners.set(partnerId, msg);
      }
    }

    const partnerIds = Array.from(partners.keys());
    if (partnerIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const partnerDetails = await User.findAll({
      where: { id: partnerIds },
      attributes: ['id', 'firstName', 'lastName', 'profilePicture']
    });

    const result = partnerDetails.map(user => ({
      user,
      lastMessage: partners.get(user.id)
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get messages for a specific partner
const getMessages = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: MessageAttachment,
          as: 'attachments'
        },
        // Include replied/forwarded message if any
        {
          model: Message,
          as: 'replyTo',
          include: [
            { model: MessageAttachment, as: 'attachments' }
          ]
        },
        {
          model: Message,
          as: 'forwardedFrom',
          include: [
            { model: MessageAttachment, as: 'attachments' }
          ]
        }
      ]
    });

    // Mark as read
    await Message.update(
      { isRead: true },
      { where: { senderId: partnerId, receiverId: userId, isRead: false } }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', tempId, replyToId, forwardedFromId } = req.body;
    const senderId = req.user.id;
    const files = req.files || [];

    // Check receiver's privacy settings
    if (senderId !== parseInt(receiverId)) {
      const privacy = await PrivacySetting.findOne({ where: { userId: receiverId } });
      if (privacy) {
        if (privacy.whoCanMessageMe === 'nobody') {
          return res.status(403).json({
            success: false,
            message: 'Người dùng này không nhận tin nhắn từ người lạ'
          });
        }
        
        if (privacy.whoCanMessageMe === 'friends') {
          const friendship = await Friendship.findOne({
            where: {
              [Op.or]: [
                { user1Id: senderId, user2Id: receiverId, status: 'accepted' },
                { user1Id: receiverId, user2Id: senderId, status: 'accepted' }
              ]
            }
          });
          
          if (!friendship) {
            return res.status(403).json({
              success: false,
              message: 'Bạn phải là bạn bè mới có thể gửi tin nhắn cho người dùng này'
            });
          }
        }
      }
    }

    // Create the message
    const message = await Message.create({
      senderId,
      receiverId,
      content: content || '',
      messageType: files.length > 0 ? (messageType === 'text' ? 'mixed' : messageType) : messageType,
      isRead: false,
      replyToId: replyToId || null,
      forwardedFromId: forwardedFromId || null
    });

    // Handle attachments if any
    const attachments = [];
    if (files.length > 0) {
      for (const file of files) {
        const attachment = await MessageAttachment.create({
          messageId: message.id,
          fileUrl: file.path, // Cloudinary URL from multer-storage-cloudinary
          fileType: file.mimetype.startsWith('image/') ? 'image' : 
                    file.mimetype.startsWith('video/') ? 'video' : 
                    file.mimetype.startsWith('audio/') ? 'audio' : 'file',
          fileName: file.originalname,
          fileSize: file.size
        });
        attachments.push(attachment);
      }
    }

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: MessageAttachment,
          as: 'attachments'
        },
        {
          model: Message,
          as: 'replyTo',
          include: [{ model: MessageAttachment, as: 'attachments' }]
        },
        {
          model: Message,
          as: 'forwardedFrom',
          include: [{ model: MessageAttachment, as: 'attachments' }]
        }
      ]
    });

    // Emit via Socket.io
    const socketMessage = {
      ...fullMessage.toJSON(),
      senderName: `${fullMessage.sender.firstName}`,
      tempId // Pass back tempId for optimistic UI
    };
    
    console.log(`📨 Emitting newMessage to user ${receiverId}:`, (socketMessage.content || '').substring(0, 20));
    sendToUser(Number(receiverId), 'newMessage', socketMessage);

    res.status(201).json({ success: true, data: fullMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadMessages = await Message.count({
      where: { receiverId: userId, isRead: false }
    });

    const { Notification } = require('../models');
    const unreadNotifications = await Notification.count({
      where: { userId, isRead: false }
    });

    res.json({
      success: true,
      data: {
        messages: unreadMessages,
        notifications: unreadNotifications
      }
    });
  } catch (error) {
    console.error('Get unread counts error:', error);
    res.status(500).json({ success: false });
  }
};

const getConversationMedia = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;

    const media = await MessageAttachment.findAll({
      include: [
        {
          model: Message,
          as: 'message',
          where: {
            [Op.or]: [
              { senderId: userId, receiverId: partnerId },
              { senderId: partnerId, receiverId: userId }
            ]
          },
          attributes: []
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Get conversation media error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCounts,
  getConversationMedia
};
