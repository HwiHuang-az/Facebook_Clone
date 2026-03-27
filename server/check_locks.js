const { sequelize } = require('./config/database');

async function checkLocks() {
  try {
    const [locks] = await sequelize.query('SHOW OPEN TABLES WHERE In_use > 0');
    console.log('Open tables in use:', locks);
    
    const [processes] = await sequelize.query('SHOW PROCESSLIST');
    console.log('Active processes:', processes.filter(p => p.Command !== 'Sleep'));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkLocks();
