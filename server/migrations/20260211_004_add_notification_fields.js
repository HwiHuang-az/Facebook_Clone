/**
 * Migration: Add notification enhanced fields
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    // Add title
    await sequelize.query(`
      ALTER TABLE notifications 
      ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT 'Notification' 
      AFTER type
    `);

    // Add read_at
    await sequelize.query(`
      ALTER TABLE notifications 
      ADD COLUMN read_at DATETIME NULL 
      AFTER is_read
    `);

    // Add action_url
    await sequelize.query(`
      ALTER TABLE notifications 
      ADD COLUMN action_url VARCHAR(500) NULL 
      AFTER read_at
    `);

    // Add metadata
    await sequelize.query(`
      ALTER TABLE notifications 
      ADD COLUMN metadata JSON NULL 
      AFTER action_url
    `);

    console.log('✅ Migration 004: Added notification enhanced fields');
  },

  down: async (sequelize) => {
    await sequelize.query(`ALTER TABLE notifications DROP COLUMN title`);
    await sequelize.query(`ALTER TABLE notifications DROP COLUMN read_at`);
    await sequelize.query(`ALTER TABLE notifications DROP COLUMN action_url`);
    await sequelize.query(`ALTER TABLE notifications DROP COLUMN metadata`);

    console.log('✅ Rollback 004: Removed notification enhanced fields');
  }
};
