/**
 * Migration: Create Reports system
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reporter_id INT NOT NULL,
        reported_user_id INT NULL,
        reported_post_id INT NULL,
        reported_comment_id INT NULL,
        report_type ENUM('spam', 'harassment', 'fake_news', 'inappropriate_content', 'violence', 'other') NOT NULL,
        description TEXT,
        status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        INDEX idx_reports_reporter (reporter_id),
        INDEX idx_reports_status (status, created_at DESC),
        INDEX idx_reports_type (report_type)
      )
    `);

    console.log('✅ Migration 016: Created reports table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS reports`);
    console.log('✅ Rollback 016: Dropped reports table');
  }
};
