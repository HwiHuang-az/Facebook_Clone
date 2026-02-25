const { sequelize } = require('../config/database');

async function updateEventSchema() {
  try {
    const [results] = await sequelize.query("SHOW COLUMNS FROM events LIKE 'group_id'");
    if (results.length === 0) {
      console.log('Adding group_id and page_id columns to events table...');
      await sequelize.query("ALTER TABLE events ADD COLUMN group_id INT NULL AFTER creator_id");
      await sequelize.query("ALTER TABLE events ADD COLUMN page_id INT NULL AFTER group_id");
      await sequelize.query("ALTER TABLE events ADD CONSTRAINT fk_event_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE");
      await sequelize.query("ALTER TABLE events ADD CONSTRAINT fk_event_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE");
      console.log('Columns added successfully.');
    } else {
      console.log('Columns already exist.');
    }
  } catch (error) {
    console.error('Error updating events table:', error);
  } finally {
    process.exit();
  }
}

updateEventSchema();
