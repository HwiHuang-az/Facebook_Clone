/**
 * Migration: Create Friend Lists for custom grouping
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    // Create friend_lists table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS friend_lists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        list_name VARCHAR(100) NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_friend_lists_user (user_id, is_default)
      )
    `);

    // Create friend_list_members table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS friend_list_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        list_id INT NOT NULL,
        friend_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES friend_lists(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_list_member (list_id, friend_id),
        INDEX idx_friend_list_members_list (list_id),
        INDEX idx_friend_list_members_friend (friend_id)
      )
    `);

    console.log('✅ Migration 019: Created friend_lists and friend_list_members tables');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS friend_list_members`);
    await sequelize.query(`DROP TABLE IF EXISTS friend_lists`);
    console.log('✅ Rollback 019: Dropped friend_lists and friend_list_members tables');
  }
};
