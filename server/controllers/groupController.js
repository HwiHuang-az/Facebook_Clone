const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');
const Post = require('../models/Post');
const { Op } = require('sequelize');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, description, privacy } = req.body;
    let { coverPhoto } = req.body;

    // Handle file upload if present
    if (req.file) {
      coverPhoto = req.file.path;
    }

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
    const { query } = req.query;
    const where = { userId };
    
    const include = [{ 
      model: Group, 
      as: 'group',
      required: true
    }];

    if (query) {
      include[0].where = {
        name: { [Op.like]: `%${query}%` }
      };
    }

    const memberships = await GroupMember.findAll({
      where,
      include
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

    const status = group.privacy === 'private' ? 'pending' : 'active';

    await GroupMember.create({
      groupId,
      userId,
      role: 'member',
      status
    });

    if (status === 'active') {
      // Increment members count only if active immediately
      await group.increment('members_count');
    }

    res.status(200).json({
      success: true,
      message: status === 'active' ? 'Joined group successfully' : 'Join request sent',
      status
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
    groupData.isMember = membership ? membership.status === 'active' : false;
    groupData.isPending = membership ? membership.status === 'pending' : false;
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
      where: { groupId, status: 'active' },
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

    // Get current user friends list once
    const myFriendships = await Friendship.findAll({
      where: {
        [Op.or]: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
        status: 'accepted'
      }
    });
    const myFriendIds = myFriendships.map(f => f.user1Id === currentUserId ? f.user2Id : f.user1Id);

    const membersWithFriendship = await Promise.all(members.map(async (member) => {
      const memberJson = member.toJSON();
      memberJson.isFriend = friendIds.includes(member.userId);
      
      // Calculate mutual friends status
      const theirFriendships = await Friendship.findAll({
        where: {
          [Op.or]: [{ user1Id: member.userId }, { user2Id: member.userId }],
          status: 'accepted'
        }
      });
      const theirFriendIds = theirFriendships.map(f => f.user1Id === member.userId ? f.user2Id : f.user1Id);
      memberJson.mutualFriendsCount = myFriendIds.filter(fid => theirFriendIds.includes(fid)).length;
      
      return memberJson;
    }));

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

// Get pending join requests
exports.getPendingMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.adminId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const pendingMembers = await GroupMember.findAll({
      where: { groupId, status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: pendingMembers
    });
  } catch (error) {
    console.error('Get pending members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve member request
exports.approveMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId } = req.params;
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.adminId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const membership = await GroupMember.findOne({
      where: { groupId, userId, status: 'pending' }
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    membership.status = 'active';
    membership.joinedAt = new Date();
    await membership.save();

    // Increment members count
    await group.increment('members_count');

    res.status(200).json({
      success: true,
      message: 'Member approved'
    });
  } catch (error) {
    console.error('Approve member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reject member request
exports.rejectMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId } = req.params;
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.adminId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const membership = await GroupMember.findOne({
      where: { groupId, userId, status: 'pending' }
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await membership.destroy();

    res.status(200).json({
      success: true,
      message: 'Member request rejected'
    });
  } catch (error) {
    console.error('Reject member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get group suggestions based on friend activity
exports.getGroupSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const Friendship = require('../models/Friendship');

    // 1. Get friend IDs
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        status: 'accepted'
      }
    });
    const friendIds = friendships.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);

    if (friendIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Get groups friends are in, that current user is NOT in
    const myMemberships = await GroupMember.findAll({
      where: { userId },
      attributes: ['groupId']
    });
    const myGroupIds = myMemberships.map(m => m.groupId);

    const friendMemberships = await GroupMember.findAll({
      where: {
        userId: friendIds,
        groupId: { [Op.notIn]: myGroupIds },
        status: 'active'
      },
      include: [
        {
          model: Group,
          as: 'group',
          where: { privacy: 'public' } // Only suggest public groups for now
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: 10
    });

    // Group by group ID to show which friends are members
    const suggestionsMap = {};
    friendMemberships.forEach(m => {
      if (!suggestionsMap[m.groupId]) {
        suggestionsMap[m.groupId] = {
          ...m.group.toJSON(),
          friends: []
        };
      }
      suggestionsMap[m.groupId].friends.push({
        id: m.userId,
        name: `${m.user.firstName} ${m.user.lastName}`
      });
    });

    const suggestions = Object.values(suggestionsMap);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change a member's role
exports.changeMemberRole = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId } = req.params;
    const { role } = req.body; // moderator, expert, member

    if (!['moderator', 'expert', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.adminId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const membership = await GroupMember.findOne({
      where: { groupId, userId, status: 'active' }
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    membership.role = role;
    await membership.save();

    res.status(200).json({
      success: true,
      message: `Member promoted to ${role}`
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
