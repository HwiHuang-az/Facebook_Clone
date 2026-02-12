# Database Migration System

## 📚 Overview

Professional database migration system for managing schema changes with version control, tracking, and rollback capabilities.

## 🚀 Quick Start

```bash
# Show migration status
node migrate.js status

# Run pending migrations
node migrate.js up

# Rollback last batch
node migrate.js down

# Create new migration
node migrate.js create add_user_preferences

# Fresh migration (drop all & re-run)
node migrate.js fresh
```

## 📁 Directory Structure

```
server/
├── migrations/
│   ├── 20260211_001_add_friendship_status.js
│   ├── 20260211_002_add_post_is_active.js
│   ├── 20260211_003_add_comment_metadata.js
│   └── 20260211_004_add_notification_fields.js
├── models/
│   └── Migration.js (tracking model)
└── migrate.js (CLI tool)
```

## 📝 Migration File Format

Each migration file has `up` and `down` methods:

```javascript
/**
 * Migration: Add user preferences
 * Date: 2026-02-11
 */

module.exports = {
  up: async (sequelize) => {
    // Apply changes
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN preferences JSON NULL
    `);
    
    console.log('✅ Migration: add_user_preferences');
  },

  down: async (sequelize) => {
    // Rollback changes
    await sequelize.query(`
      ALTER TABLE users 
      DROP COLUMN preferences
    `);
    
    console.log('✅ Rollback: add_user_preferences');
  }
};
```

## 🔧 CLI Commands

### `node migrate.js status`
Shows which migrations have been executed and which are pending.

**Output:**
```
📊 Migration Status:

✅ Executed:
   20260211_001_add_friendship_status.js
   20260211_002_add_post_is_active.js

⏳ Pending:
   20260211_003_add_comment_metadata.js
```

### `node migrate.js up`
Runs all pending migrations in order.

**Output:**
```
📦 Running 2 migration(s)...

⏳ Running: 20260211_003_add_comment_metadata.js
✅ Migrated: 20260211_003_add_comment_metadata.js

✅ Migration completed! Batch: 2
```

### `node migrate.js down`
Rolls back the last batch of migrations.

**Output:**
```
📦 Rolling back batch 2 (1 migration(s))...

⏳ Rolling back: 20260211_003_add_comment_metadata.js
✅ Rolled back: 20260211_003_add_comment_metadata.js

✅ Rollback completed!
```

### `node migrate.js create <name>`
Creates a new migration file with timestamp.

**Example:**
```bash
node migrate.js create add_user_preferences
```

**Output:**
```
✅ Created migration: 20260211_005_add_user_preferences.js
```

### `node migrate.js fresh`
⚠️ **WARNING**: Drops all tables and re-runs all migrations. Use with caution!

## 📊 Migration Tracking

Migrations are tracked in the `migrations` table:

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment ID |
| name | VARCHAR(255) | Migration filename |
| batch | INT | Batch number |
| executed_at | DATETIME | When migration ran |

## 🔄 Workflow

### Adding a New Feature

1. **Create migration:**
   ```bash
   node migrate.js create add_user_settings
   ```

2. **Edit migration file:**
   ```javascript
   // migrations/20260211_005_add_user_settings.js
   module.exports = {
     up: async (sequelize) => {
       await sequelize.query(`
         CREATE TABLE user_settings (
           id INT PRIMARY KEY AUTO_INCREMENT,
           user_id INT NOT NULL,
           theme VARCHAR(20) DEFAULT 'light',
           language VARCHAR(10) DEFAULT 'en',
           FOREIGN KEY (user_id) REFERENCES users(id)
         )
       `);
     },
     
     down: async (sequelize) => {
       await sequelize.query(`DROP TABLE user_settings`);
     }
   };
   ```

3. **Run migration:**
   ```bash
   node migrate.js up
   ```

4. **If something goes wrong, rollback:**
   ```bash
   node migrate.js down
   ```

### Team Collaboration

1. **Pull latest code** with new migrations
2. **Run migrations:**
   ```bash
   node migrate.js up
   ```
3. **Your database is now up to date!**

## ✅ Best Practices

1. **Always write `down` method** - Enable rollback capability
2. **One change per migration** - Keep migrations focused
3. **Test rollback** - Ensure `down` works before committing
4. **Never modify executed migrations** - Create new ones instead
5. **Use descriptive names** - `add_user_email_verification` not `update_users`
6. **Commit migrations with code** - Keep schema and code in sync

## 🐛 Troubleshooting

### Migration fails halfway
```bash
# Check what went wrong
node migrate.js status

# Fix the migration file
# Then run again
node migrate.js up
```

### Need to start fresh
```bash
# ⚠️ This drops ALL tables
node migrate.js fresh
```

### Migration already executed manually
```javascript
// Mark as executed without running
const Migration = require('./models/Migration');
await Migration.create({
  name: '20260211_001_add_friendship_status.js',
  batch: 1
});
```

## 📋 Existing Migrations

### 001: Add Friendship Status
- Adds `status`, `initiated_by`, `accepted_at` to friendships
- Drops unused `friend_requests` table

### 002: Add Post Is Active
- Adds `is_active` for soft delete support

### 003: Add Comment Metadata
- Adds `is_edited`, `edited_at`, `replies_count`

### 004: Add Notification Fields
- Adds `title`, `read_at`, `action_url`, `metadata`

## 🔗 Related Files

- `models/Migration.js` - Tracking model
- `migrate.js` - CLI tool
- `migrations/` - Migration files
