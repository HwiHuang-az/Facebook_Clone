"use strict";

module.exports = {
  up: async (sequelize) => {
    // Add columns
    await sequelize.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to INT NULL`);
    await sequelize.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS forwarded_from INT NULL`);

    // Add foreign key constraints (use IF NOT EXISTS via check)
    try {
      await sequelize.query(`ALTER TABLE messages ADD CONSTRAINT fk_messages_reply_to FOREIGN KEY (reply_to) REFERENCES messages(id) ON DELETE SET NULL ON UPDATE CASCADE`);
    } catch (e) {
      // ignore if constraint exists
    }

    try {
      await sequelize.query(`ALTER TABLE messages ADD CONSTRAINT fk_messages_forwarded_from FOREIGN KEY (forwarded_from) REFERENCES messages(id) ON DELETE SET NULL ON UPDATE CASCADE`);
    } catch (e) {
      // ignore if constraint exists
    }

    console.log('✅ Migration: add reply_to and forwarded_from to messages');
  },

  down: async (sequelize) => {
    try {
      await sequelize.query(`ALTER TABLE messages DROP FOREIGN KEY fk_messages_reply_to`);
    } catch (e) {}
    try {
      await sequelize.query(`ALTER TABLE messages DROP FOREIGN KEY fk_messages_forwarded_from`);
    } catch (e) {}

    await sequelize.query(`ALTER TABLE messages DROP COLUMN IF EXISTS reply_to`);
    await sequelize.query(`ALTER TABLE messages DROP COLUMN IF EXISTS forwarded_from`);

    console.log('✅ Rollback: remove reply_to and forwarded_from from messages');
  }
};
