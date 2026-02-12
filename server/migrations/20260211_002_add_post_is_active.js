/**
 * Migration: Add is_active field to posts
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      ALTER TABLE posts 
      ADD COLUMN is_active TINYINT(1) DEFAULT 1 
      AFTER shares_count
    `);

    console.log('✅ Migration 002: Added is_active to posts');
  },

  down: async (sequelize) => {
    await sequelize.query(`ALTER TABLE posts DROP COLUMN is_active`);

    console.log('✅ Rollback 002: Removed is_active from posts');
  }
};
