const { sequelize } = require('../models');

async function migrateLikes() {
  try {
    console.log('🔄 Starting Like schema migration for Pages...');

    // 1. Add page_id column to likes table if it doesn't exist
    const [pageResults] = await sequelize.query("SHOW COLUMNS FROM likes LIKE 'page_id'");
    if (pageResults.length === 0) {
      console.log('➕ Adding page_id column to likes table...');
      await sequelize.query("ALTER TABLE likes ADD COLUMN page_id INT DEFAULT NULL AFTER comment_id");
      await sequelize.query("ALTER TABLE likes ADD CONSTRAINT fk_likes_page_id FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE ON UPDATE CASCADE");
      await sequelize.query("ALTER TABLE likes ADD CONSTRAINT unique_page_like UNIQUE (user_id, page_id)");
      console.log('✅ page_id column and constraints added.');
    } else {
      console.log('ℹ️ page_id column already exists.');
    }

    console.log('🚀 Like schema migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateLikes();
