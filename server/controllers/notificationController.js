const { Notification, User } = require('../models');
const { sendToUser } = require('../utils/socket');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({ 
      success: true, 
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.update({ isRead: true }, { where: { userId: req.user.id } });
    } else {
      await Notification.update({ isRead: true }, { where: { id, userId: req.user.id } });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ success: false });
  }
};

// Internal utility to create and notify
const createNotification = async ({ userId, fromUserId, type, postId = null, commentId = null, message }) => {
  try {
    if (userId === fromUserId) return; // Don't notify self

    const notification = await Notification.create({
      userId,
      fromUserId,
      type,
      postId,
      commentId,
      message,
      isRead: false
    });

    const fullNotification = await Notification.findByPk(notification.id, {
      include: [{ model: User, as: 'fromUser', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] }]
    });

    // Real-time emit
    sendToUser(userId, 'newNotification', fullNotification);
    
    return fullNotification;
  } catch (error) {
    console.error('Create internal notification error:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};
