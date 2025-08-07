const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Enable foreign key support
    db.exec('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error("Could not enable foreign keys:", err);
      }
    });
  }
});

module.exports = db;