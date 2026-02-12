/**
 * Migration: Create Marketplace Items
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS marketplace_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'VND',
        category VARCHAR(50),
        condition_item ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good',
        location VARCHAR(255),
        seller_id INT NOT NULL,
        images TEXT,
        is_sold BOOLEAN DEFAULT false,
        views_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_marketplace_seller (seller_id),
        INDEX idx_marketplace_category (category, is_sold),
        INDEX idx_marketplace_location (location),
        INDEX idx_marketplace_price (price)
      )
    `);

    console.log('✅ Migration 012: Created marketplace_items table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS marketplace_items`);
    console.log('✅ Rollback 012: Dropped marketplace_items table');
  }
};
