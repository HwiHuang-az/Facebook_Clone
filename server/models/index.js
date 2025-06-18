const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Friendship = require('./Friendship');
const Message = require('./Message');
const Notification = require('./Notification');

// Define relationships

// User - Post relationship
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// User - Comment relationship
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Post - Comment relationship
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment - Comment relationship (replies)
Comment.hasMany(Comment, { foreignKey: 'parentCommentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentCommentId', as: 'parentComment' });

// User - Like relationship
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Post - Like relationship
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment - Like relationship
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// User - Friendship relationship
User.belongsToMany(User, {
  through: Friendship,
  foreignKey: 'user1Id',
  otherKey: 'user2Id',
  as: 'friends'
});

// User - Message relationship (sender)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User - Message relationship (receiver)
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// User - Notification relationship (user receiving notification)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Notification relationship (user who triggered notification)
User.hasMany(Notification, { foreignKey: 'fromUserId', as: 'triggeredNotifications' });
Notification.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });

// Post - Notification relationship
Post.hasMany(Notification, { foreignKey: 'postId', as: 'notifications' });
Notification.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment - Notification relationship
Comment.hasMany(Notification, { foreignKey: 'commentId', as: 'notifications' });
Notification.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Friendship,
  Message,
  Notification
}; 