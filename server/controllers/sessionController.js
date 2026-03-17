const { UserSession } = require('../models');
const { Op } = require('sequelize');

// Get all active sessions for current user
exports.getSessions = async (req, res) => {
    try {
        const sessions = await UserSession.findAll({
            where: {
                userId: req.user.id,
                isActive: true
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải danh sách phiên đăng nhập'
        });
    }
};

// Revoke a specific session
exports.revokeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await UserSession.findOne({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiên đăng nhập'
            });
        }

        session.isActive = false;
        await session.save();

        res.json({
            success: true,
            message: 'Đã đăng xuất khỏi thiết bị này'
        });
    } catch (error) {
        console.error('Revoke session error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa phiên đăng nhập'
        });
    }
};

// Revoke all other sessions
exports.revokeAllOtherSessions = async (req, res) => {
    try {
        const currentToken = req.headers.authorization?.split(' ')[1];
        
        await UserSession.update(
            { isActive: false },
            {
                where: {
                    userId: req.user.id,
                    isActive: true,
                    sessionToken: { [Op.ne]: currentToken }
                }
            }
        );

        res.json({
            success: true,
            message: 'Đã đăng xuất khỏi tất cả các thiết bị khác'
        });
    } catch (error) {
        console.error('Revoke all sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa các phiên đăng nhập khác'
        });
    }
};
