/**
 * Migration: Create Groups feature
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`groups\` (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        privacy ENUM('public', 'closed', 'secret') DEFAULT 'public',
        cover_photo VARCHAR(255),
        admin_id INT NOT NULL,
        members_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_groups_admin (admin_id),
        INDEX idx_groups_privacy (privacy)
      )
    `);

    console.log('✅ Migration 007: Created groups table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS \`groups\``);
    console.log('✅ Rollback 007: Dropped groups table');
  }
};
