const { sequelize, MessageAttachment, Message } = require('../models');

async function fixDatabase() {
  try {
    console.log('🔄 Starting database fix...');
    
    // 1. Ensure new tables are created
    await sequelize.sync({ alter: false });
    console.log('✅ New tables (if any) created.');

    // 2. Add message_type column to messages table if it doesn't exist
    const [results] = await sequelize.query("SHOW COLUMNS FROM messages LIKE 'message_type'");
    if (results.length === 0) {
      console.log('➕ Adding message_type column to messages table...');
      await sequelize.query("ALTER TABLE messages ADD COLUMN message_type ENUM('text', 'image', 'video', 'audio', 'file', 'mixed') DEFAULT 'text' AFTER is_read");
      console.log('✅ message_type column added.');
    } else {
      console.log('ℹ️ message_type column already exists.');
    }

    console.log('🚀 Database fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    process.exit(1);
  }
}

fixDatabase();
