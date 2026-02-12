/**
 * Migration: Add comment metadata fields
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    // Add is_edited
    await sequelize.query(`
      ALTER TABLE comments 
      ADD COLUMN is_edited TINYINT(1) DEFAULT 0 
      AFTER likes_count
    `);

    // Add edited_at
    await sequelize.query(`
      ALTER TABLE comments 
      ADD COLUMN edited_at DATETIME NULL 
      AFTER is_edited
    `);

    // Add replies_count
    await sequelize.query(`
      ALTER TABLE comments 
      ADD COLUMN replies_count INT DEFAULT 0 
      AFTER edited_at
    `);

    console.log('✅ Migration 003: Added comment metadata fields');
  },

  down: async (sequelize) => {
    await sequelize.query(`ALTER TABLE comments DROP COLUMN is_edited`);
    await sequelize.query(`ALTER TABLE comments DROP COLUMN edited_at`);
    await sequelize.query(`ALTER TABLE comments DROP COLUMN replies_count`);

    console.log('✅ Rollback 003: Removed comment metadata fields');
  }
};
