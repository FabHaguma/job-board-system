const express = require('express');
const { getAllJobs, createJob, applyToJob, getJobApplications } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

// Public route
router.get('/', getAllJobs);

// Admin route
router.post('/', protect, admin, createJob);

// User route
router.post('/:id/apply', protect, applyToJob);

// Admin route
router.get('/:id/applications', protect, admin, getJobApplications);

module.exports = router;