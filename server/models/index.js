const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Friendship = require('./Friendship');
const Message = require('./Message');
const Notification = require('./Notification');

// New models
const Story = require('./Story');
const StoryView = require('./StoryView');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Page = require('./Page');
const Event = require('./Event');
const EventResponse = require('./EventResponse');
const MarketplaceItem = require('./MarketplaceItem');
const SavedPost = require('./SavedPost');
const PostShare = require('./PostShare');
const BlockedUser = require('./BlockedUser');
const Report = require('./Report');
const PrivacySetting = require('./PrivacySetting');
const UserSession = require('./UserSession');
const FriendList = require('./FriendList');
const FriendListMember = require('./FriendListMember');

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

// Friendship - User relationship
Friendship.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
Friendship.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });

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

// ===== NEW MODEL ASSOCIATIONS =====

// User - Story relationship
User.hasMany(Story, { foreignKey: 'userId', as: 'stories' });
Story.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Story - StoryView relationship
Story.hasMany(StoryView, { foreignKey: 'storyId', as: 'views' });
StoryView.belongsTo(Story, { foreignKey: 'storyId', as: 'story' });
User.hasMany(StoryView, { foreignKey: 'userId', as: 'storyViews' });
StoryView.belongsTo(User, { foreignKey: 'userId', as: 'viewer' });

// User - Group relationship
User.hasMany(Group, { foreignKey: 'adminId', as: 'adminGroups' });
Group.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// Group - GroupMember relationship
Group.hasMany(GroupMember, { foreignKey: 'groupId', as: 'members' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
User.hasMany(GroupMember, { foreignKey: 'userId', as: 'groupMemberships' });
GroupMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Page relationship
User.hasMany(Page, { foreignKey: 'ownerId', as: 'pages' });
Page.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User - Event relationship
User.hasMany(Event, { foreignKey: 'creatorId', as: 'events' });
Event.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Event - EventResponse relationship
Event.hasMany(EventResponse, { foreignKey: 'eventId', as: 'responses' });
EventResponse.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
User.hasMany(EventResponse, { foreignKey: 'userId', as: 'eventResponses' });
EventResponse.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - MarketplaceItem relationship
User.hasMany(MarketplaceItem, { foreignKey: 'sellerId', as: 'marketplaceItems' });
MarketplaceItem.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// User - SavedPost relationship
User.hasMany(SavedPost, { foreignKey: 'userId', as: 'savedPosts' });
SavedPost.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(SavedPost, { foreignKey: 'postId', as: 'savedBy' });
SavedPost.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// User - PostShare relationship
User.hasMany(PostShare, { foreignKey: 'userId', as: 'sharedPosts' });
PostShare.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(PostShare, { foreignKey: 'postId', as: 'shares' });
PostShare.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// User - BlockedUser relationship
User.hasMany(BlockedUser, { foreignKey: 'blockerId', as: 'blockedUsers' });
BlockedUser.belongsTo(User, { foreignKey: 'blockerId', as: 'blocker' });
User.hasMany(BlockedUser, { foreignKey: 'blockedId', as: 'blockedBy' });
BlockedUser.belongsTo(User, { foreignKey: 'blockedId', as: 'blocked' });

// User - Report relationship
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
User.hasMany(Report, { foreignKey: 'reportedUserId', as: 'reportsAgainst' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });
Post.hasMany(Report, { foreignKey: 'reportedPostId', as: 'reports' });
Report.belongsTo(Post, { foreignKey: 'reportedPostId', as: 'reportedPost' });
Comment.hasMany(Report, { foreignKey: 'reportedCommentId', as: 'reports' });
Report.belongsTo(Comment, { foreignKey: 'reportedCommentId', as: 'reportedComment' });

// User - PrivacySetting relationship (one-to-one)
User.hasOne(PrivacySetting, { foreignKey: 'userId', as: 'privacySettings' });
PrivacySetting.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - UserSession relationship
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - FriendList relationship
User.hasMany(FriendList, { foreignKey: 'userId', as: 'friendLists' });
FriendList.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// FriendList - FriendListMember relationship
FriendList.hasMany(FriendListMember, { foreignKey: 'listId', as: 'members' });
FriendListMember.belongsTo(FriendList, { foreignKey: 'listId', as: 'list' });
User.hasMany(FriendListMember, { foreignKey: 'friendId', as: 'friendListMemberships' });
FriendListMember.belongsTo(User, { foreignKey: 'friendId', as: 'friend' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Friendship,
  Message,
  Notification,
  // New models
  Story,
  StoryView,
  Group,
  GroupMember,
  Page,
  Event,
  EventResponse,
  MarketplaceItem,
  SavedPost,
  PostShare,
  BlockedUser,
  Report,
  PrivacySetting,
  UserSession,
  FriendList,
  FriendListMember
};