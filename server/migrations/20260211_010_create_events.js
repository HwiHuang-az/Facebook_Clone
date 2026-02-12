/**
 * Migration: Create Events feature
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        cover_photo VARCHAR(255),
        privacy ENUM('public', 'friends', 'private') DEFAULT 'public',
        creator_id INT NOT NULL,
        interested_count INT DEFAULT 0,
        going_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_events_creator (creator_id),
        INDEX idx_events_date (start_date, end_date),
        INDEX idx_events_privacy (privacy)
      )
    `);

    console.log('✅ Migration 010: Created events table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS events`);
    console.log('✅ Rollback 010: Dropped events table');
  }
};
