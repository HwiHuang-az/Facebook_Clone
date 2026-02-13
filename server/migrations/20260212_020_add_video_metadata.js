/**
 * Migration: Add video metadata fields to posts
 * Date: 2026-02-12
 */

module.exports = {
  up: async (sequelize) => {
    // Add duration column
    await sequelize.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS duration INTEGER
    `);

    // Add views_count column
    await sequelize.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0
    `);

    // Add thumbnail_url column
    await sequelize.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255)
    `);

    console.log('✅ Migration 020: Added video metadata fields to posts (duration, views_count, thumbnail_url)');
  },

  down: async (sequelize) => {
    await sequelize.query(`ALTER TABLE posts DROP COLUMN IF EXISTS duration`);
    await sequelize.query(`ALTER TABLE posts DROP COLUMN IF EXISTS views_count`);
    await sequelize.query(`ALTER TABLE posts DROP COLUMN IF EXISTS thumbnail_url`);

    console.log('✅ Rollback 020: Removed video metadata fields from posts');
  }
};
