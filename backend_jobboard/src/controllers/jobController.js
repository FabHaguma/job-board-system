const db = require('../../db/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/cvs/';
    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + originalname
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only PDFs
        if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('cv_file'); // 'cv_file' is the name of the form field

// PUBLIC: Get all jobs with filtering and pagination
const getAllJobs = (req, res) => {
  const { search, location, tags, page = 1, limit = 10 } = req.query;

  let sql = `SELECT * FROM jobs WHERE is_archived = 0`;
  const params = [];

  if (search) {
    sql += ` AND (title LIKE ? OR company_description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (location) {
    sql += ` AND location LIKE ?`;
    params.push(`%${location}%`);
  }
  if (tags) {
    // Basic tag search: finds if any part of the comma-separated tag list matches
    sql += ` AND tags LIKE ?`;
    params.push(`%${tags}%`);
  }

  sql += ` ORDER BY date_posted DESC LIMIT ? OFFSET ?`;
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  
  // A second query to get the total count for pagination
  let countSql = `SELECT COUNT(*) as count FROM jobs WHERE is_archived = 0`;
  if (search) countSql += ` AND (title LIKE '%${search}%' OR company_description LIKE '%${search}%')`;
  if (location) countSql += ` AND location LIKE '%${location}%'`;
  if (tags) countSql += ` AND tags LIKE '%${tags}%'`;


  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving jobs', error: err.message });
    }
    db.get(countSql, [], (err, countRow) => {
        if(err) {
            return res.status(500).json({ message: 'Error counting jobs' });
        }
        res.json({
            data: rows,
            totalPages: Math.ceil(countRow.count / limit),
            currentPage: parseInt(page),
        });
    });
  });
};

// PUBLIC: Get a single job by ID
const getJobById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM jobs WHERE id = ? AND is_archived = 0`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving job' });
        }
        if (!row) {
            return res.status(404).json({ message: 'Job not found or has been archived' });
        }
        res.json(row);
    });
};

// ADMIN: Create a job (updated with new fields)
const createJob = (req, res) => {
  const { title, company_name, company_description, job_description, location, requirements, salary, tags, deadline } = req.body;
  const sql = `INSERT INTO jobs (title, company_name, company_description, job_description, location, requirements, salary, tags, deadline) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [title, company_name, company_description, job_description, location, requirements, salary, tags, deadline], function(err) {
    if (err) {
      return res.status(400).json({ message: 'Error creating job', error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
};

// ADMIN: Update a job
const updateJob = (req, res) => {
    const { id } = req.params;
    const { title, company_name, company_description, job_description, location, requirements, salary, tags, deadline } = req.body;
    const sql = `UPDATE jobs SET 
                    title = ?, company_name = ?, company_description = ?, job_description = ?, location = ?, 
                    requirements = ?, salary = ?, tags = ?, deadline = ?
                 WHERE id = ?`;
    db.run(sql, [title, company_name, company_description, job_description, location, requirements, salary, tags, deadline, id], function(err) {
        if (err) {
            return res.status(400).json({ message: 'Error updating job', error: err.message });
        }
        res.json({ message: `Job ${id} updated successfully` });
    });
};

// ADMIN: Archive a job (soft delete)
const archiveJob = (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE jobs SET is_archived = 1 WHERE id = ?`;
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error archiving job' });
        }
        res.json({ message: `Job ${id} archived successfully` });
    });
};

// ADMIN: Get all jobs including archived ones
const getAdminAllJobs = (req, res) => {
  const sql = `SELECT * FROM jobs ORDER BY date_posted DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving jobs' });
    }
    res.json(rows);
  });
};

// ADMIN: Update application status
const updateApplicationStatus = (req, res) => {
    const { appId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const sql = `UPDATE applications SET status = ? WHERE id = ?`;
    db.run(sql, [status, appId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error updating application status' });
        }
        res.json({ message: `Application ${appId} status updated to ${status}` });
    });
};

// USER: Apply to a job
const applyToJob = (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      // Custom error from fileFilter
      return res.status(400).json({ message: err.message });
    }

    const { cover_letter } = req.body;
    const cv_path = req.file ? req.file.path : null;
    const job_id = req.params.id;
    const user_id = req.user.id;

    if (!cover_letter || !cv_path) {
      return res.status(400).json({ message: 'Cover letter and CV file are required.' });
    }

    // Check if user already applied to this job
    const checkSql = `SELECT id FROM applications WHERE job_id = ? AND user_id = ?`;
    db.get(checkSql, [job_id, user_id], (err, existingApplication) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking existing application' });
        }
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        // Use the file path as the cv_url
        const sql = `INSERT INTO applications (job_id, user_id, cover_letter, cv_url, status) 
                     VALUES (?, ?, ?, ?, 'pending')`;
        db.run(sql, [job_id, user_id, cover_letter, cv_path], function (err) {
          if (err) {
            return res.status(400).json({ message: 'Error submitting application', error: err.message });
          }
          res.status(201).json({ 
              message: 'Application submitted successfully', 
              applicationId: this.lastID 
          });
        });
    });
  });
};
// ADMIN: Get applications for a job
const getJobApplications = (req, res) => {
    const job_id = req.params.id;
    const sql = `SELECT a.id, a.status, u.username, a.cover_letter, a.cv_url, a.application_date as created_at
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

// ADMIN: Get all applications across all jobs
const getAllApplications = (req, res) => {
    const sql = `SELECT a.id, a.status, u.username, a.cover_letter, a.cv_url, a.application_date, 
                        j.title as job_title, j.company_name, a.job_id
                 FROM applications a
                 JOIN users u ON a.user_id = u.id
                 JOIN jobs j ON a.job_id = j.id
                 ORDER BY a.application_date DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching applications' });
        }
        res.json(rows);
    });
};


module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    archiveJob,
    getAdminAllJobs,
    updateApplicationStatus,
    applyToJob,
    getJobApplications,
    getAllApplications,
};