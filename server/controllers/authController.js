const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, PrivacySetting, UserRole, UserRoleAssignment } = require('../models');
const { Op } = require('sequelize');

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Kiểm tra độ tuổi (phải >= 13 tuổi)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải ít nhất 13 tuổi để tạo tài khoản'
      });
    }

    // Tạo user mới
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender
    });

    // Gán role mặc định
    const regularRole = await UserRole.findOne({ 
      where: { roleName: 'regular_user' } 
    });
    
    if (regularRole) {
      await UserRoleAssignment.create({
        userId: newUser.id,
        roleId: regularRole.id
      });
    }

    // Tạo privacy settings mặc định
    await PrivacySetting.create({
      userId: newUser.id,
      profileVisibility: 'friends',
      postDefaultPrivacy: 'friends',
      whoCanSendFriendRequests: 'everyone'
    });

    // Tạo token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          profilePicture: newUser.profilePicture
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Tìm user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra account có active không
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = generateToken(user.id);

    // Cập nhật last login (nếu có bảng admin_users)
    try {
      const adminUser = await user.getAdminUser();
      if (adminUser) {
        adminUser.lastLogin = new Date();
        await adminUser.save();
      }
    } catch (err) {
      // Ignore if not admin
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy thông tin user hiện tại
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    // Lấy thêm thông tin role và privacy settings
    const userRole = await UserRoleAssignment.findOne({
      where: { userId: user.id, isActive: true },
      include: [{ model: UserRole, as: 'role' }]
    });

    const privacySettings = await PrivacySetting.findOne({
      where: { userId: user.id }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture,
          coverPhoto: user.coverPhoto,
          bio: user.bio,
          location: user.location,
          workplace: user.workplace,
          education: user.education,
          relationshipStatus: user.relationshipStatus,
          isVerified: user.isVerified,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender
        },
        role: userRole?.role || null,
        privacySettings
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Đăng xuất
const logout = async (req, res) => {
  try {
    // Trong thực tế có thể blacklist token hoặc xóa session
    // Ở đây chỉ trả về response success
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng xuất'
    });
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đổi mật khẩu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Quên mật khẩu (gửi email reset)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Không tiết lộ email có tồn tại hay không
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu'
      });
    }

    // TODO: Implement email sending logic
    // const resetToken = generateResetToken(user.id);
    // await sendResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý quên mật khẩu'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
const refreshToken = async (req, res) => {
  try {
    // Tạo token mới
    const token = jwt.sign(
      { userId: req.user.userId },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Refresh token thành công',
      token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  forgotPassword,
  refreshToken
}; 