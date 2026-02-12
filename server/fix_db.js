const { sequelize } = require('./config/database');
const { DataTypes } = require('sequelize');

async function fix() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    console.log('Adding "type" column to "posts" table...');
    await queryInterface.addColumn('posts', 'type', {
      type: DataTypes.ENUM('normal', 'profile_update', 'cover_update'),
      defaultValue: 'normal',
      after: 'shares_count'
    });
    console.log('✅ Column "type" added successfully!');
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('Duplicate column name')) {
      console.log('ℹ️ Column "type" already exists.');
    } else {
      console.error('❌ Error adding column:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

fix();
