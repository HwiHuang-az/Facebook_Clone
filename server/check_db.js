const { sequelize } = require('./config/database');
const Like = require('./models/Like');

async function check() {
  try {
    const tableDesc = await sequelize.getQueryInterface().describeTable('likes');
    console.log('Likes table structure:', JSON.stringify(tableDesc, null, 2));
    
    // Also check sample record
    const sample = await Like.findOne();
    console.log('Sample record:', sample ? JSON.stringify(sample.toJSON(), null, 2) : 'No records');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
