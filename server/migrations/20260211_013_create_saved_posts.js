/**
 * Migration: Create Saved Posts
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        collection_name VARCHAR(100) DEFAULT 'Saved Items',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_saved (user_id, post_id),
        INDEX idx_saved_posts_user (user_id, created_at DESC),
        INDEX idx_saved_posts_collection (user_id, collection_name)
      )
    `);

    console.log('✅ Migration 013: Created saved_posts table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS saved_posts`);
    console.log('✅ Rollback 013: Dropped saved_posts table');
  }
};
