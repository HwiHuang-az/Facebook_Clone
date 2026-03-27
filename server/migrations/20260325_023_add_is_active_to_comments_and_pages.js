module.exports = {
  up: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    // Add is_active to comments
    try {
      await queryInterface.addColumn('comments', 'is_active', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
      console.log('✅ Added is_active to comments');
    } catch (err) {
      console.log('⚠️  is_active may already exist in comments');
    }

    // Add is_active to pages
    try {
      await queryInterface.addColumn('pages', 'is_active', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
      console.log('✅ Added is_active to pages');
    } catch (err) {
      console.log('⚠️  is_active may already exist in pages');
    }

    // Add is_active to marketplace_items
    try {
      await queryInterface.addColumn('marketplace_items', 'is_active', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
      console.log('✅ Added is_active to marketplace_items');
    } catch (err) {
      console.log('⚠️  is_active may already exist in marketplace_items');
    }
  },

  down: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();
    try {
      await queryInterface.removeColumn('comments', 'is_active');
      await queryInterface.removeColumn('pages', 'is_active');
      await queryInterface.removeColumn('marketplace_items', 'is_active');
      console.log('✅ Rollback: is_active columns removed');
    } catch (err) {
      console.log('⚠️  Rollback failed or columns already removed');
    }
  }
};
