module.exports = {
  up: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();

    // 1. Add last_active to users
    try {
      await queryInterface.addColumn('users', 'last_active', {
        type: require('sequelize').DataTypes.DATE,
        defaultValue: require('sequelize').DataTypes.NOW,
        allowNull: true
      });
      console.log('✅ Added last_active to users');
    } catch (err) {
      console.log('⚠️  last_active may already exist in users');
    }

    // 2. Handle Ads table
    try {
      // Check if ads table exists
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('ads')) {
        await queryInterface.createTable('ads', {
          id: {
            type: require('sequelize').DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          title: {
            type: require('sequelize').DataTypes.STRING(100),
            allowNull: false
          },
          description: {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
          },
          image_url: {
            type: require('sequelize').DataTypes.STRING(255),
            allowNull: false
          },
          target_url: {
            type: require('sequelize').DataTypes.STRING(255),
            allowNull: false
          },
          sponsor_name: {
            type: require('sequelize').DataTypes.STRING(100),
            allowNull: false
          },
          target_location: {
            type: require('sequelize').DataTypes.STRING(100),
            allowNull: true
          },
          budget: {
            type: require('sequelize').DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
          },
          status: {
            type: require('sequelize').DataTypes.ENUM('active', 'paused', 'completed'),
            defaultValue: 'active'
          },
          created_at: {
            type: require('sequelize').DataTypes.DATE,
            allowNull: false
          },
          updated_at: {
            type: require('sequelize').DataTypes.DATE,
            allowNull: false
          }
        });
        console.log('✅ Created ads table');
      } else {
        // Just add target_location if table exists
        try {
          await queryInterface.addColumn('ads', 'target_location', {
            type: require('sequelize').DataTypes.STRING(100),
            allowNull: true
          });
          console.log('✅ Added target_location to ads');
        } catch (err) {
          console.log('⚠️  target_location may already exist in ads');
        }
      }
    } catch (err) {
      console.error('❌ Error handling ads table:', err);
    }

    // 3. Add marketplace_item_id to saved_posts
    try {
      await queryInterface.addColumn('saved_posts', 'marketplace_item_id', {
        type: require('sequelize').DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'marketplace_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      console.log('✅ Added marketplace_item_id to saved_posts');
    } catch (err) {
      console.log('⚠️  marketplace_item_id may already exist in saved_posts');
    }
    
    console.log('✅ Migration: add_missing_columns_v2 completed');
  },

  down: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();
    try {
      await queryInterface.removeColumn('users', 'last_active');
      await queryInterface.removeColumn('saved_posts', 'marketplace_item_id');
      // Non-destructive: we won't drop the ads table in down for safety
      console.log('✅ Rollback: add_missing_columns_v2 partial');
    } catch (err) {
      console.log('⚠️  Rollback failed or columns already removed');
    }
  }
};
