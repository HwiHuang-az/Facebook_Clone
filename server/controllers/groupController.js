const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');
const { Op } = require('sequelize');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, description, privacy, coverPhoto } = req.body;

    const group = await Group.create({
      name,
      description,
      privacy,
      coverPhoto,
      adminId
    });

    // Automatically add admin as a member
    await GroupMember.create({
      groupId: group.id,
      userId: adminId,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all groups (public ones for browsing)
exports.getGroups = async (req, res) => {
  try {
    const { query, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const where = { privacy: 'public' };
    if (query) {
      where.name = { [Op.like]: `%${query}%` };
    }

    const { count, rows } = await Group.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get groups user is a member of
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberships = await GroupMember.findAll({
      where: { userId },
      include: [{ model: Group, as: 'group' }]
    });

    const groups = memberships.map(m => m.group);

    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.id;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const existingMember = await GroupMember.findOne({
      where: { groupId, userId }
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    await GroupMember.create({
      groupId,
      userId,
      role: 'member'
    });

    // Increment members count
    await group.increment('members_count');

    res.status(200).json({
      success: true,
      message: 'Joined group successfully'
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.id;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const membership = await GroupMember.findOne({
      where: { groupId, userId }
    });

    if (!membership) {
      return res.status(400).json({ success: false, message: 'Not a member' });
    }

    if (membership.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin cannot leave group' });
    }

    await membership.destroy();

    // Decrement members count
    await group.decrement('members_count');

    res.status(200).json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
