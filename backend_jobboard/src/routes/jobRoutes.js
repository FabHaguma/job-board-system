const express = require('express');
const { 
    getAllJobs, getJobById, createJob, applyToJob, getJobApplications, 
    updateJob, archiveJob, getAdminAllJobs, updateApplicationStatus, getAllApplications,
    getUserApplications, upload 
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

// --- Public Routes ---
router.get('/', getAllJobs);       // GET all jobs with filters/pagination
router.get('/:id', getJobById);    // GET a single job by ID

// --- User Routes ---
// The 'protect' middleware should come first to handle authentication.
// Multer's 'upload' middleware will then process the multipart/form-data.
router.post('/:id/apply', protect, upload.single('cv_file'), applyToJob); // Apply to a job
router.get('/user/applications', protect, getUserApplications); // Get user's own applications

// --- Admin Routes ---
router.post('/', protect, admin, createJob);                // Create a new job
router.get('/admin/all', protect, admin, getAdminAllJobs);    // Get all jobs (incl. archived)
router.get('/admin/all-applications', protect, admin, getAllApplications); // Get all applications across all jobs
router.put('/:id', protect, admin, updateJob);              // Update a job
router.delete('/:id', protect, admin, archiveJob);          // Archive a job
router.get('/:id/applications', protect, admin, getJobApplications); // Get applications for a job
router.put('/applications/:appId', protect, admin, updateApplicationStatus); // Update application status

module.exports = router;