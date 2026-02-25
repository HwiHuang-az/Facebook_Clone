const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');
const Post = require('../models/Post');
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

// Get single group detail
exports.getGroupById = async (req, res) => {
  try {
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if current user is a member
    const membership = await GroupMember.findOne({
      where: { groupId: group.id, userId }
    });

    const groupData = group.toJSON();
    groupData.isMember = !!membership;
    groupData.role = membership ? membership.role : null;

    res.status(200).json({
      success: true,
      data: groupData
    });
  } catch (error) {
    console.error('Get group by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Get group members
exports.getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'work', 'education']
        }
      ],
      order: [['role', 'ASC'], ['joinedAt', 'ASC']]
    });

    // Check friendship status for each member
    const currentUserId = req.user.id;
    const Friendship = require('../models/Friendship');
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { user1Id: currentUserId },
          { user2Id: currentUserId }
        ],
        status: 'accepted'
      }
    });

    const friendIds = friendships.map(f => f.user1Id === currentUserId ? f.user2Id : f.user1Id);

    const membersWithFriendship = members.map(member => {
      const memberJson = member.toJSON();
      memberJson.isFriend = friendIds.includes(member.userId);
      return memberJson;
    });

    res.status(200).json({
      success: true,
      data: membersWithFriendship
    });
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Update group cover photo
exports.updateGroupCover = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.adminId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    group.coverPhoto = req.file.path;
    await group.save();

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Update group cover error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getGroupMedia = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: {
        groupId,
        isActive: true,
        [Op.or]: [
          { imageUrl: { [Op.ne]: null } },
          { videoUrl: { [Op.ne]: null } }
        ]
      },
      attributes: ['id', 'imageUrl', 'videoUrl', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const media = posts.rows.map(post => ({
      postId: post.id,
      url: post.imageUrl || post.videoUrl,
      type: post.imageUrl ? 'image' : 'video',
      createdAt: post.createdAt
    }));

    res.status(200).json({
      success: true,
      data: media,
      pagination: {
        total: posts.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(posts.count / limit)
      }
    });
  } catch (error) {
    console.error('Get group media error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
