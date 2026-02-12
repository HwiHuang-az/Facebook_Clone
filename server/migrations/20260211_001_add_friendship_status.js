/**
 * Migration: Add friendship status and related fields
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    const { QueryInterface } = sequelize;
    
    // Add status column
    await sequelize.query(`
      ALTER TABLE friendships 
      ADD COLUMN status ENUM('pending', 'accepted', 'declined', 'blocked') 
      DEFAULT 'accepted' 
      AFTER user2_id
    `);

    // Add initiated_by column
    await sequelize.query(`
      ALTER TABLE friendships 
      ADD COLUMN initiated_by INT NOT NULL DEFAULT 1 
      AFTER status
    `);

    // Add accepted_at column
    await sequelize.query(`
      ALTER TABLE friendships 
      ADD COLUMN accepted_at DATETIME NULL 
      AFTER initiated_by
    `);

    // Update existing friendships
    await sequelize.query(`
      UPDATE friendships 
      SET status = 'accepted', accepted_at = created_at 
      WHERE status = 'accepted' OR status IS NULL
    `);

    // Drop unused friend_requests table if exists
    await sequelize.query(`DROP TABLE IF EXISTS friend_requests`);

    console.log('✅ Migration 001: Added friendship status fields');
  },

  down: async (sequelize) => {
    // Remove added columns
    await sequelize.query(`ALTER TABLE friendships DROP COLUMN status`);
    await sequelize.query(`ALTER TABLE friendships DROP COLUMN initiated_by`);
    await sequelize.query(`ALTER TABLE friendships DROP COLUMN accepted_at`);

    console.log('✅ Rollback 001: Removed friendship status fields');
  }
};
