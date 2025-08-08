const fs = require('fs');
const path = require('path');
const db = require('./database.js');

const migrationFile = 'migration_02.sql';
const migrationSql = fs.readFileSync(path.join(__dirname, migrationFile), 'utf8');

db.exec(migrationSql, (err) => {
  if (err) {
    return console.error(`Error running migration ${migrationFile}:`, err.message);
  }
  console.log(`Migration ${migrationFile} applied successfully.`);
  db.close();
});