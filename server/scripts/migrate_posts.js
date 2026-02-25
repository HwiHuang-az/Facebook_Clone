const { sequelize } = require('../models');

async function migratePosts() {
  try {
    console.log('🔄 Starting Post schema migration...');

    // 1. Add group_id column to posts table if it doesn't exist
    const [groupResults] = await sequelize.query("SHOW COLUMNS FROM posts LIKE 'group_id'");
    if (groupResults.length === 0) {
      console.log('➕ Adding group_id column to posts table...');
      await sequelize.query("ALTER TABLE posts ADD COLUMN group_id INT DEFAULT NULL AFTER activity");
      await sequelize.query("ALTER TABLE posts ADD CONSTRAINT fk_posts_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL ON UPDATE CASCADE");
      console.log('✅ group_id column added.');
    } else {
      console.log('ℹ️ group_id column already exists.');
    }

    // 2. Add page_id column to posts table if it doesn't exist
    const [pageResults] = await sequelize.query("SHOW COLUMNS FROM posts LIKE 'page_id'");
    if (pageResults.length === 0) {
      console.log('➕ Adding page_id column to posts table...');
      await sequelize.query("ALTER TABLE posts ADD COLUMN page_id INT DEFAULT NULL AFTER group_id");
      await sequelize.query("ALTER TABLE posts ADD CONSTRAINT fk_posts_page_id FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL ON UPDATE CASCADE");
      console.log('✅ page_id column added.');
    } else {
      console.log('ℹ️ page_id column already exists.');
    }

    console.log('🚀 Post schema migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePosts();
