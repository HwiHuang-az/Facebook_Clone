/**
 * Migration: Create User Sessions for security
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        device_info TEXT,
        ip_address VARCHAR(45),
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_sessions_user (user_id, is_active, expires_at),
        INDEX idx_user_sessions_token (session_token)
      )
    `);

    console.log('✅ Migration 018: Created user_sessions table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS user_sessions`);
    console.log('✅ Rollback 018: Dropped user_sessions table');
  }
};
