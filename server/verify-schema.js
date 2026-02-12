const { sequelize } = require('./config/database');

async function cleanupSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // 1. Drop unused friend_requests table (we use friendships with status instead)
    console.log('1️⃣ Removing unused friend_requests table...');
    try {
      await sequelize.query('DROP TABLE IF EXISTS friend_requests');
      console.log('✅ Dropped friend_requests table\n');
    } catch (e) {
      console.log('⚠️ Could not drop friend_requests:', e.message, '\n');
    }

    // 2. Verify friendships table has all required columns
    console.log('2️⃣ Verifying friendships table structure...');
    const [friendshipsSchema] = await sequelize.query('DESCRIBE friendships');
    const friendshipsColumns = friendshipsSchema.map(col => col.Field);
    console.log('Current columns:', friendshipsColumns.join(', '));
    
    const requiredColumns = ['id', 'user1_id', 'user2_id', 'status', 'initiated_by', 'accepted_at', 'created_at'];
    const missingColumns = requiredColumns.filter(col => !friendshipsColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns exist\n');
    } else {
      console.log('❌ Missing columns:', missingColumns.join(', '), '\n');
    }

    // 3. Verify posts table has is_active
    console.log('3️⃣ Verifying posts table structure...');
    const [postsSchema] = await sequelize.query('DESCRIBE posts');
    const postsColumns = postsSchema.map(col => col.Field);
    
    if (postsColumns.includes('is_active')) {
      console.log('✅ posts.is_active exists\n');
    } else {
      console.log('❌ posts.is_active missing\n');
    }

    // 4. Verify comments table has metadata columns
    console.log('4️⃣ Verifying comments table structure...');
    const [commentsSchema] = await sequelize.query('DESCRIBE comments');
    const commentsColumns = commentsSchema.map(col => col.Field);
    
    const commentMetadataColumns = ['is_edited', 'edited_at', 'replies_count'];
    const missingCommentColumns = commentMetadataColumns.filter(col => !commentsColumns.includes(col));
    
    if (missingCommentColumns.length === 0) {
      console.log('✅ All comment metadata columns exist\n');
    } else {
      console.log('❌ Missing comment columns:', missingCommentColumns.join(', '), '\n');
    }

    // 5. Verify notifications table
    console.log('5️⃣ Verifying notifications table structure...');
    const [notificationsSchema] = await sequelize.query('DESCRIBE notifications');
    const notificationsColumns = notificationsSchema.map(col => col.Field);
    
    const notificationRequiredColumns = ['title', 'read_at', 'action_url', 'metadata'];
    const missingNotificationColumns = notificationRequiredColumns.filter(col => !notificationsColumns.includes(col));
    
    if (missingNotificationColumns.length === 0) {
      console.log('✅ All notification columns exist\n');
    } else {
      console.log('⚠️ Missing notification columns:', missingNotificationColumns.join(', '));
      console.log('   (These are optional for now)\n');
    }

    console.log('=' .repeat(60));
    console.log('✅ Schema verification complete!');
    console.log('=' .repeat(60));

  } catch (err) {
    console.error('❌ ERROR:', err);
  } finally {
    process.exit();
  }
}

cleanupSchema();
