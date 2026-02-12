const { PrivacySetting, User } = require('../models');

// Get privacy settings
exports.getPrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    let settings = await PrivacySetting.findOne({
      where: { userId }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await PrivacySetting.create({
        userId,
        profileVisibility: 'friends',
        contactInfoVisibility: 'friends',
        friendListVisibility: 'friends',
        postDefaultPrivacy: 'friends',
        storyPrivacy: 'friends',
        whoCanSendFriendRequests: 'everyone',
        whoCanMessageMe: 'friends',
        whoCanTagMe: 'friends',
        whoCanPostOnTimeline: 'friends',
        whoCanSeePostsOnTimeline: 'friends',
        searchByEmail: true,
        searchByPhone: true,
        searchEnginesIndexing: false,
        activityStatusVisible: true,
        readReceiptsEnabled: true
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get privacy settings',
      error: error.message 
    });
  }
};

// Update privacy settings
exports.updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Allowed fields to update
    const allowedFields = [
      'profileVisibility',
      'contactInfoVisibility',
      'friendListVisibility',
      'postDefaultPrivacy',
      'storyPrivacy',
      'whoCanSendFriendRequests',
      'whoCanMessageMe',
      'whoCanTagMe',
      'whoCanPostOnTimeline',
      'whoCanSeePostsOnTimeline',
      'searchByEmail',
      'searchByPhone',
      'searchEnginesIndexing',
      'activityStatusVisible',
      'readReceiptsEnabled'
    ];

    // Filter only allowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    let settings = await PrivacySetting.findOne({
      where: { userId }
    });

    if (!settings) {
      // Create with updates
      settings = await PrivacySetting.create({
        userId,
        ...filteredUpdates
      });
    } else {
      // Update existing
      await settings.update(filteredUpdates);
    }

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update privacy settings',
      error: error.message 
    });
  }
};

// Reset to default settings
exports.resetPrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const defaultSettings = {
      profileVisibility: 'friends',
      contactInfoVisibility: 'friends',
      friendListVisibility: 'friends',
      postDefaultPrivacy: 'friends',
      storyPrivacy: 'friends',
      whoCanSendFriendRequests: 'everyone',
      whoCanMessageMe: 'friends',
      whoCanTagMe: 'friends',
      whoCanPostOnTimeline: 'friends',
      whoCanSeePostsOnTimeline: 'friends',
      searchByEmail: true,
      searchByPhone: true,
      searchEnginesIndexing: false,
      activityStatusVisible: true,
      readReceiptsEnabled: true
    };

    let settings = await PrivacySetting.findOne({
      where: { userId }
    });

    if (!settings) {
      settings = await PrivacySetting.create({
        userId,
        ...defaultSettings
      });
    } else {
      await settings.update(defaultSettings);
    }

    res.json({
      success: true,
      message: 'Privacy settings reset to default',
      data: settings
    });
  } catch (error) {
    console.error('Reset privacy settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset privacy settings',
      error: error.message 
    });
  }
};
