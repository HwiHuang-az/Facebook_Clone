const { sequelize } = require('./config/database');

async function runMigration() {
    try {
        console.log('Running migration: Adding video metadata columns...');
        
        // Add duration column
        await sequelize.query(`
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS duration INTEGER;
        `);
        console.log('✓ Added duration column');
        
        // Add views_count column
        await sequelize.query(`
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
        `);
        console.log('✓ Added views_count column');
        
        // Add thumbnail_url column
        await sequelize.query(`
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255);
        `);
        console.log('✓ Added thumbnail_url column');
        
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
