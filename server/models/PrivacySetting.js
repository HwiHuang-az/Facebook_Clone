const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PrivacySetting = sequelize.define('PrivacySetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id'
  },
  profileVisibility: {
    type: DataTypes.ENUM('public', 'friends', 'friends_of_friends', 'only_me'),
    defaultValue: 'friends',
    field: 'profile_visibility'
  },
  contactInfoVisibility: {
    type: DataTypes.ENUM('public', 'friends', 'only_me'),
    defaultValue: 'friends',
    field: 'contact_info_visibility'
  },
  friendListVisibility: {
    type: DataTypes.ENUM('public', 'friends', 'only_me'),
    defaultValue: 'friends',
    field: 'friend_list_visibility'
  },
  postDefaultPrivacy: {
    type: DataTypes.ENUM('public', 'friends', 'friends_of_friends', 'only_me'),
    defaultValue: 'friends',
    field: 'post_default_privacy'
  },
  storyPrivacy: {
    type: DataTypes.ENUM('public', 'friends', 'close_friends', 'custom'),
    defaultValue: 'friends',
    field: 'story_privacy'
  },
  whoCanSendFriendRequests: {
    type: DataTypes.ENUM('everyone', 'friends_of_friends', 'nobody'),
    defaultValue: 'everyone',
    field: 'who_can_send_friend_requests'
  },
  whoCanMessageMe: {
    type: DataTypes.ENUM('everyone', 'friends', 'nobody'),
    defaultValue: 'friends',
    field: 'who_can_message_me'
  },
  whoCanTagMe: {
    type: DataTypes.ENUM('everyone', 'friends', 'nobody'),
    defaultValue: 'friends',
    field: 'who_can_tag_me'
  },
  whoCanPostOnTimeline: {
    type: DataTypes.ENUM('everyone', 'friends', 'only_me'),
    defaultValue: 'friends',
    field: 'who_can_post_on_timeline'
  },
  whoCanSeePostsOnTimeline: {
    type: DataTypes.ENUM('public', 'friends', 'friends_of_friends', 'only_me'),
    defaultValue: 'friends',
    field: 'who_can_see_posts_on_timeline'
  },
  searchByEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'search_by_email'
  },
  searchByPhone: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'search_by_phone'
  },
  searchEnginesIndexing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'search_engines_indexing'
  },
  activityStatusVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activity_status_visible'
  },
  readReceiptsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'read_receipts_enabled'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'privacy_settings',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    }
  ]
});

module.exports = PrivacySetting;
