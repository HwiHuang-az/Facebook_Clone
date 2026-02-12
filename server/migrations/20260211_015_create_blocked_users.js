/**
 * Migration: Create Blocked Users
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        blocker_id INT NOT NULL,
        blocked_id INT NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_block (blocker_id, blocked_id),
        INDEX idx_blocked_users_blocker (blocker_id),
        INDEX idx_blocked_users_blocked (blocked_id)
      )
    `);

    console.log('✅ Migration 015: Created blocked_users table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS blocked_users`);
    console.log('✅ Rollback 015: Dropped blocked_users table');
  }
};
