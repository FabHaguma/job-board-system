const express = require('express');
const { 
    getAllJobs, getJobById, createJob, applyToJob, getJobApplications, 
    updateJob, archiveJob, getAdminAllJobs, updateApplicationStatus 
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

// --- Public Routes ---
router.get('/', getAllJobs);       // GET all jobs with filters/pagination
router.get('/:id', getJobById);    // GET a single job by ID

// --- User Routes ---
router.post('/:id/apply', protect, applyToJob); // Apply to a job

// --- Admin Routes ---
router.post('/', protect, admin, createJob);                // Create a new job
router.get('/admin/all', protect, admin, getAdminAllJobs);    // Get all jobs (incl. archived)
router.put('/:id', protect, admin, updateJob);              // Update a job
router.delete('/:id', protect, admin, archiveJob);          // Archive a job
router.get('/:id/applications', protect, admin, getJobApplications); // Get applications for a job
router.put('/applications/:appId', protect, admin, updateApplicationStatus); // Update application status

module.exports = router;