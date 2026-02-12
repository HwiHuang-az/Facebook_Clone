/**
 * Migration: Create Group Members
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_membership (group_id, user_id),
        INDEX idx_group_members_group (group_id),
        INDEX idx_group_members_user (user_id)
      )
    `);

    console.log('✅ Migration 008: Created group_members table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS group_members`);
    console.log('✅ Rollback 008: Dropped group_members table');
  }
};
