const { sequelize } = require('./config/database');
const Migration = require('./models/Migration');

async function markAsExecuted() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Since we already ran these migrations manually,
    // mark them as executed to avoid running them again
    const migrations = [
      '20260211_001_add_friendship_status.js',
      '20260211_002_add_post_is_active.js',
      '20260211_003_add_comment_metadata.js',
      '20260211_004_add_notification_fields.js'
    ];

    console.log('📝 Marking migrations as executed...\n');

    for (const name of migrations) {
      await Migration.create({
        name: name,
        batch: 1,
        executedAt: new Date()
      });
      console.log(`✅ Marked: ${name}`);
    }

    console.log('\n✅ All migrations marked as executed!\n');
    console.log('Run `node migrate.js status` to verify\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

markAsExecuted();
