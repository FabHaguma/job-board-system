const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create a test database in memory
const createTestDB = () => {
  return new sqlite3.Database(':memory:');
};

// Initialize test database with schema
const initTestDB = (db) => {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, '../../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schema, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

// Seed test database with sample data
const seedTestDB = (db) => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);
    const adminPassword = bcrypt.hashSync('admin123', salt);

    const seedQueries = [
      // Users
      `INSERT INTO users (username, password_hash, role) VALUES 
       ('testuser', '${hashedPassword}', 'user'),
       ('admin', '${adminPassword}', 'admin')`,
      
      // Jobs
      `INSERT INTO jobs (title, company_name, company_description, job_description, location, requirements, salary, tags, deadline) VALUES 
       ('Software Developer', 'Tech Corp', 'Leading tech company', 'Develop software solutions', 'Remote', 'JavaScript, Node.js', '$60,000-$80,000', 'tech,remote', '2024-12-31'),
       ('Marketing Manager', 'Marketing Inc', 'Marketing agency', 'Manage marketing campaigns', 'New York', 'Marketing experience', '$50,000-$70,000', 'marketing,management', '2024-11-30'),
       ('Archived Job', 'Old Company', 'Archived position', 'This job is archived', 'London', 'N/A', '$40,000', 'archived', '2024-10-30')`,
      
      // Archive one job
      `UPDATE jobs SET is_archived = 1 WHERE title = 'Archived Job'`,
      
      // Applications
      `INSERT INTO applications (job_id, user_id, cover_letter, cv_url, status) VALUES 
       (1, 1, 'I am very interested in this position...', '/uploads/cvs/test-cv.pdf', 'pending'),
       (2, 1, 'Perfect fit for my marketing skills...', '/uploads/cvs/test-cv-2.pdf', 'reviewed')`
    ];

    let completedQueries = 0;
    seedQueries.forEach((query) => {
      db.run(query, (err) => {
        if (err) {
          reject(err);
        } else {
          completedQueries++;
          if (completedQueries === seedQueries.length) {
            resolve(db);
          }
        }
      });
    });
  });
};

// Clean up test database
const cleanupTestDB = (db) => {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing test database:', err);
      }
      resolve();
    });
  });
};

module.exports = {
  createTestDB,
  initTestDB,
  seedTestDB,
  cleanupTestDB
};
