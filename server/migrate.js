#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { sequelize } = require('./config/database');
const Migration = require('./models/Migration');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Ensure migrations table exists
async function ensureMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      batch INT NOT NULL DEFAULT 1,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Get all migration files
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR);
    return [];
  }
  
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.js'))
    .sort();
}

// Get executed migrations from database
async function getExecutedMigrations() {
  const migrations = await Migration.findAll({
    order: [['name', 'ASC']]
  });
  return migrations.map(m => m.name);
}

// Get pending migrations
async function getPendingMigrations() {
  const allFiles = getMigrationFiles();
  const executed = await getExecutedMigrations();
  return allFiles.filter(file => !executed.includes(file));
}

// Run migrations
async function runMigrations() {
  try {
    await sequelize.authenticate();
    await ensureMigrationsTable();

    const pending = await getPendingMigrations();
    
    if (pending.length === 0) {
      log('✅ No pending migrations', 'green');
      return;
    }

    log(`\n📦 Running ${pending.length} migration(s)...\n`, 'blue');

    // Get next batch number
    const lastMigration = await Migration.findOne({
      order: [['batch', 'DESC']]
    });
    const batch = lastMigration ? lastMigration.batch + 1 : 1;

    for (const file of pending) {
      const migration = require(path.join(MIGRATIONS_DIR, file));
      
      log(`⏳ Running: ${file}`, 'yellow');
      
      await migration.up(sequelize);
      
      await Migration.create({
        name: file,
        batch: batch
      });
      
      log(`✅ Migrated: ${file}`, 'green');
    }

    log(`\n✅ Migration completed! Batch: ${batch}\n`, 'green');
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}\n`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Rollback last batch
async function rollbackMigrations() {
  try {
    await sequelize.authenticate();
    await ensureMigrationsTable();

    const lastMigration = await Migration.findOne({
      order: [['batch', 'DESC']]
    });

    if (!lastMigration) {
      log('✅ Nothing to rollback', 'green');
      return;
    }

    const batch = lastMigration.batch;
    const migrations = await Migration.findAll({
      where: { batch },
      order: [['name', 'DESC']]
    });

    log(`\n📦 Rolling back batch ${batch} (${migrations.length} migration(s))...\n`, 'blue');

    for (const record of migrations) {
      const file = record.name;
      const migrationPath = path.join(MIGRATIONS_DIR, file);
      
      if (!fs.existsSync(migrationPath)) {
        log(`⚠️  Migration file not found: ${file}`, 'yellow');
        continue;
      }

      const migration = require(migrationPath);
      
      log(`⏳ Rolling back: ${file}`, 'yellow');
      
      await migration.down(sequelize);
      await record.destroy();
      
      log(`✅ Rolled back: ${file}`, 'green');
    }

    log(`\n✅ Rollback completed!\n`, 'green');
  } catch (error) {
    log(`\n❌ Rollback failed: ${error.message}\n`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Show migration status
async function showStatus() {
  try {
    await sequelize.authenticate();
    await ensureMigrationsTable();

    const allFiles = getMigrationFiles();
    const executed = await getExecutedMigrations();
    const pending = allFiles.filter(file => !executed.includes(file));

    log('\n📊 Migration Status:\n', 'blue');

    if (executed.length > 0) {
      log('✅ Executed:', 'green');
      executed.forEach(file => log(`   ${file}`, 'green'));
    }

    if (pending.length > 0) {
      log('\n⏳ Pending:', 'yellow');
      pending.forEach(file => log(`   ${file}`, 'yellow'));
    }

    if (executed.length === 0 && pending.length === 0) {
      log('No migrations found', 'yellow');
    }

    log('');
  } catch (error) {
    log(`\n❌ Error: ${error.message}\n`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Create new migration file
function createMigration(name) {
  if (!name) {
    log('❌ Please provide a migration name', 'red');
    log('Usage: node migrate.js create <migration_name>', 'yellow');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const files = getMigrationFiles();
  const lastNumber = files.length > 0 
    ? parseInt(files[files.length - 1].split('_')[1]) 
    : 0;
  const nextNumber = String(lastNumber + 1).padStart(3, '0');
  
  const filename = `${timestamp}_${nextNumber}_${name}.js`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const template = `/**
 * Migration: ${name.replace(/_/g, ' ')}
 * Date: ${new Date().toISOString().split('T')[0]}
 */

module.exports = {
  up: async (sequelize) => {
    // Write migration code here
    
    console.log('✅ Migration: ${name}');
  },

  down: async (sequelize) => {
    // Write rollback code here
    
    console.log('✅ Rollback: ${name}');
  }
};
`;

  fs.writeFileSync(filepath, template);
  log(`\n✅ Created migration: ${filename}\n`, 'green');
}

// Fresh migration (drop all and re-run)
async function freshMigration() {
  try {
    await sequelize.authenticate();
    
    log('\n⚠️  WARNING: This will drop all tables and re-run migrations!', 'red');
    log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n', 'yellow');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    log('🗑️  Dropping all tables...', 'yellow');
    await sequelize.drop();
    
    log('📦 Running fresh migrations...\n', 'blue');
    await runMigrations();
    
    log('✅ Fresh migration completed!\n', 'green');
  } catch (error) {
    log(`\n❌ Fresh migration failed: ${error.message}\n`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Main CLI
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'up':
      await runMigrations();
      break;
    case 'down':
      await rollbackMigrations();
      break;
    case 'status':
      await showStatus();
      break;
    case 'create':
      createMigration(arg);
      break;
    case 'fresh':
      await freshMigration();
      break;
    default:
      log('\n📚 Migration CLI Commands:\n', 'blue');
      log('  node migrate.js up              - Run pending migrations');
      log('  node migrate.js down            - Rollback last batch');
      log('  node migrate.js status          - Show migration status');
      log('  node migrate.js create <name>   - Create new migration');
      log('  node migrate.js fresh           - Drop all & re-run migrations');
      log('');
  }

  await sequelize.close();
  process.exit(0);
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
