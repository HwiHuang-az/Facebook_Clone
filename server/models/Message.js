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
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'file', 'emoji', 'sticker'),
    defaultValue: 'text'
  },
  attachment: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  conversationId: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['senderId', 'receiverId', 'createdAt']
    },
    {
      fields: ['conversationId', 'createdAt']
    },
    {
      fields: ['isRead']
    }
  ],
  validate: {
    usersNotSame() {
      if (this.senderId === this.receiverId) {
        throw new Error('Người dùng không thể gửi tin nhắn cho chính mình');
      }
    }
  }
});

module.exports = Message; 