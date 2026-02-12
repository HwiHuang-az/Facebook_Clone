/**
 * Migration: Create Story Views tracking
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS story_views (
        id INT PRIMARY KEY AUTO_INCREMENT,
        story_id INT NOT NULL,
        user_id INT NOT NULL,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_view (story_id, user_id),
        INDEX idx_story_views_story (story_id),
        INDEX idx_story_views_user (user_id)
      )
    `);

    console.log('✅ Migration 006: Created story_views table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS story_views`);
    console.log('✅ Rollback 006: Dropped story_views table');
  }
};
