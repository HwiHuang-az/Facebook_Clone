/**
 * Migration: Create Privacy Settings
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS privacy_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        profile_visibility ENUM('public', 'friends', 'friends_of_friends', 'only_me') DEFAULT 'friends',
        contact_info_visibility ENUM('public', 'friends', 'only_me') DEFAULT 'friends',
        friend_list_visibility ENUM('public', 'friends', 'only_me') DEFAULT 'friends',
        post_default_privacy ENUM('public', 'friends', 'friends_of_friends', 'only_me') DEFAULT 'friends',
        story_privacy ENUM('public', 'friends', 'close_friends', 'custom') DEFAULT 'friends',
        who_can_send_friend_requests ENUM('everyone', 'friends_of_friends', 'nobody') DEFAULT 'everyone',
        who_can_message_me ENUM('everyone', 'friends', 'nobody') DEFAULT 'friends',
        who_can_tag_me ENUM('everyone', 'friends', 'nobody') DEFAULT 'friends',
        who_can_post_on_timeline ENUM('everyone', 'friends', 'only_me') DEFAULT 'friends',
        who_can_see_posts_on_timeline ENUM('public', 'friends', 'friends_of_friends', 'only_me') DEFAULT 'friends',
        search_by_email BOOLEAN DEFAULT true,
        search_by_phone BOOLEAN DEFAULT true,
        search_engines_indexing BOOLEAN DEFAULT false,
        activity_status_visible BOOLEAN DEFAULT true,
        read_receipts_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_privacy_settings_user (user_id)
      )
    `);

    console.log('✅ Migration 017: Created privacy_settings table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS privacy_settings`);
    console.log('✅ Rollback 017: Dropped privacy_settings table');
  }
};
