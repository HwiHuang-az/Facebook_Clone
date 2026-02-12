/**
 * Migration: Create Pages feature
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE,
        category VARCHAR(50),
        description TEXT,
        profile_picture VARCHAR(255),
        cover_photo VARCHAR(255),
        website VARCHAR(255),
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        owner_id INT NOT NULL,
        followers_count INT DEFAULT 0,
        likes_count INT DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_pages_owner (owner_id),
        INDEX idx_pages_category (category),
        INDEX idx_pages_verified (is_verified)
      )
    `);

    console.log('✅ Migration 009: Created pages table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS pages`);
    console.log('✅ Rollback 009: Dropped pages table');
  }
};
