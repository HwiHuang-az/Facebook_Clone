/**
 * Migration: Create Post Shares
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS post_shares (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        shared_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        INDEX idx_post_shares_user (user_id, created_at DESC),
        INDEX idx_post_shares_post (post_id, created_at DESC)
      )
    `);

    console.log('✅ Migration 014: Created post_shares table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS post_shares`);
    console.log('✅ Rollback 014: Dropped post_shares table');
  }
};
