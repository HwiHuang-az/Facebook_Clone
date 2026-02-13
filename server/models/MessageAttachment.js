const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MessageAttachment = sequelize.define('MessageAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'message_id',
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  fileUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_url'
  },
  fileType: {
    type: DataTypes.ENUM('image', 'video', 'audio', 'file'),
    allowNull: false,
    field: 'file_type'
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'file_name'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size'
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
  tableName: 'message_attachments',
  timestamps: true
});

module.exports = MessageAttachment;
