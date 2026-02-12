/**
 * Migration: Create Stories feature
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        content TEXT,
        image_url VARCHAR(255),
        video_url VARCHAR(255),
        background_color VARCHAR(7),
        expires_at TIMESTAMP,
        views_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_stories_user (user_id, created_at DESC),
        INDEX idx_stories_expires (expires_at)
      )
    `);

    console.log('✅ Migration 005: Created stories table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS stories`);
    console.log('✅ Rollback 005: Dropped stories table');
  }
};
