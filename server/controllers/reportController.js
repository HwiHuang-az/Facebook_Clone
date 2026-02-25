const { Report, Post, Comment, User } = require('../models');

// Create a report
exports.createReport = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { reportedUserId, reportedPostId, reportedCommentId, reportType, description } = req.body;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    // Ensure at least one target is specified
    if (!reportedUserId && !reportedPostId && !reportedCommentId) {
      return res.status(400).json({
        success: false,
        message: 'Report target (user, post, or comment) is required'
      });
    }

    const report = await Report.create({
      reporterId,
      reportedUserId,
      reportedPostId,
      reportedCommentId,
      reportType,
      description,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
};

// Get reports (for admin/moderator - optional for now)
exports.getReports = async (req, res) => {
  try {
    // Basic implementation: anyone can see reports for now, but in a real app this would be restricted
    const { status, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.reportType = type;

    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'reportedUser', attributes: ['id', 'firstName', 'lastName'] },
        { model: Post, as: 'reportedPost', attributes: ['id', 'content'] },
        { model: Comment, as: 'reportedComment', attributes: ['id', 'content'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: reports,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};
