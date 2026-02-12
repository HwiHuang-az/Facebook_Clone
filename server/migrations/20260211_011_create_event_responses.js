/**
 * Migration: Create Event Responses
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS event_responses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        response ENUM('going', 'interested', 'not_going') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_response (event_id, user_id),
        INDEX idx_event_responses_event (event_id, response),
        INDEX idx_event_responses_user (user_id)
      )
    `);

    console.log('✅ Migration 011: Created event_responses table');
  },

  down: async (sequelize) => {
    await sequelize.query(`DROP TABLE IF EXISTS event_responses`);
    console.log('✅ Rollback 011: Dropped event_responses table');
  }
};
