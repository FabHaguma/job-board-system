const express = require('express');
const { getAllUsers, promoteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

// All routes are admin-only
router.use(protect, admin);

router.get('/', getAllUsers);
router.put('/:id/promote', promoteUser);

module.exports = router;