const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = async (req, res, next) => {
  try {
    const adminUser = await req.user.getAdminUser();
    
    if (!adminUser || !adminUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking admin permissions'
    });
  }
};

// Middleware kiểm tra quyền cụ thể
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = await req.user.getUserRole();
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned'
        });
      }

      const permissions = userRole.permissions;
      const hasPermission = permissions[resource]?.includes(action);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${action} on ${resource}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Middleware kiểm tra user có bị ban không
const checkUserStatus = async (req, res, next) => {
  try {
    const activePenalties = await req.user.getActivePenalties();
    
    // Kiểm tra permanent ban
    const permanentBan = activePenalties.find(p => p.penaltyType === 'permanent_ban');
    if (permanentBan) {
      return res.status(403).json({
        success: false,
        message: 'Account permanently banned',
        reason: permanentBan.reason
      });
    }

    // Kiểm tra temporary ban
    const tempBan = activePenalties.find(p => 
      p.penaltyType === 'temporary_ban' && 
      new Date() < new Date(p.endDate)
    );
    if (tempBan) {
      return res.status(403).json({
        success: false,
        message: 'Account temporarily banned',
        reason: tempBan.reason,
        endsAt: tempBan.endDate
      });
    }

    req.userPenalties = activePenalties;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking user status'
    });
  }
};

// Middleware rate limiting
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  checkPermission,
  checkUserStatus,
  createRateLimit
}; 