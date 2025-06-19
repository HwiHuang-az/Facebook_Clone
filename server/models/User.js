const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'date_of_birth'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other')
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    defaultValue: 'default-avatar.png',
    field: 'profile_picture'
  },
  coverPhoto: {
    type: DataTypes.STRING(255),
    field: 'cover_photo'
  },
  bio: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING(100)
  },
  work: {
    type: DataTypes.STRING(100)
  },
  education: {
    type: DataTypes.STRING(100)
  },
  relationshipStatus: {
    type: DataTypes.ENUM('single', 'in_relationship', 'married', 'complicated'),
    field: 'relationship_status'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password; // Không trả về password
  return values;
};

// Class methods
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findActive = function() {
  return this.findAll({ where: { isActive: true } });
};

module.exports = User; 