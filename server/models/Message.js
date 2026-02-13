const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nội dung tin nhắn không được để trống'
      },
      len: {
        args: [1, 5000],
        msg: 'Nội dung tin nhắn phải từ 1-5000 ký tự'
      }
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'receiver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url',
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    field: 'video_url',
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  // Fields not in SQL schema
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'file', 'mixed'),
    defaultValue: 'text',
    field: 'message_type'
  },
  // attachment: {
  //   type: DataTypes.STRING(500),
  //   allowNull: true
  // },
  // readAt: {
  //   type: DataTypes.DATE,
  //   allowNull: true
  // },
  // isDeleted: {
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: false
  // },
  // deletedAt: {
  //   type: DataTypes.DATE,
  //   allowNull: true
  // },
  // conversationId: {
  //   type: DataTypes.STRING(100),
  //   allowNull: false
  // }
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['sender_id', 'receiver_id', 'created_at']
    },
    // {
    //   fields: ['conversationId', 'createdAt']
    // },
    // {
    //   fields: ['isRead']
    // }
  ],
  validate: {
    usersNotSame() {
      if (this.senderId && this.receiverId && this.senderId === this.receiverId) {
        throw new Error('Người dùng không thể gửi tin nhắn cho chính mình');
      }
    }
  }
});

module.exports = Message;