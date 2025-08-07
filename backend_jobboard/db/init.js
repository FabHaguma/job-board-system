const fs = require('fs');
const path = require('path');
const db = require('./database.js');

console.log('Running initialization script...');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

db.serialize(() => {
  console.log('Executing schema...');
  db.exec(schema, (err) => {
    if (err) {
      return console.error('Error executing schema:', err.message);
    }
    console.log('Tables created successfully.');

    console.log('Executing seed...');
    db.exec(seed, (err) => {
      if (err) {
        return console.error('Error executing seed:', err.message);
      }
      console.log('Data seeded successfully.');
      db.close();
      console.log('Database connection closed.');
    });
  });
});