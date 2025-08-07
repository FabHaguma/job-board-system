const db = require('../../db/database');

// PUBLIC: Get all jobs
const getAllJobs = (req, res) => {
  const sql = `SELECT id, title, company_description, location, date_posted 
               FROM jobs 
               ORDER BY date_posted DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving jobs' });
    }
    res.json(rows);
  });
};

// ADMIN: Create a job
const createJob = (req, res) => {
  const { title, company_description, job_description, location } = req.body;
  const sql = `INSERT INTO jobs (title, company_description, job_description, location) 
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [title, company_description, job_description, location], function(err) {
    if (err) {
      return res.status(400).json({ message: 'Error creating job' });
    }
    res.status(201).json({ id: this.lastID });
  });
};

// USER: Apply to a job
const applyToJob = (req, res) => {
  const { cover_letter, cv_url } = req.body;
  const job_id = req.params.id;
  const user_id = req.user.id; // From auth middleware

  const sql = `INSERT INTO applications (job_id, user_id, cover_letter, cv_url) 
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [job_id, user_id, cover_letter, cv_url], function(err) {
    if (err) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    res.status(201).json({ message: 'Application submitted successfully' });
  });
};

// ADMIN: Get applications for a job
const getJobApplications = (req, res) => {
  const job_id = req.params.id;
  const sql = `SELECT a.id, u.username, a.cover_letter, a.cv_url, a.application_date 
               FROM applications a
               JOIN users u ON a.user_id = u.id
               WHERE a.job_id = ?`;
  db.all(sql, [job_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching applications' });
    }
    res.json(rows);
  });
};

module.exports = { getAllJobs, createJob, applyToJob, getJobApplications };