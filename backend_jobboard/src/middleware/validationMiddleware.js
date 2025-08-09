const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()
      .map(error => error.msg)
      .join(', ');
    
    return res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
  next();
};

// Common validation rules
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim()
    .escape(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

const validateRegister = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

const validateJob = [
  body('title')
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters')
    .trim()
    .escape(),
  
  body('company')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters')
    .trim()
    .escape(),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim()
    .escape(),
  
  body('description')
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 10 })
    .withMessage('Job description must be at least 10 characters long')
    .trim(),
  
  body('salary')
    .optional()
    .trim()
    .escape(),
  
  body('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'temporary', 'internship'])
    .withMessage('Invalid job type'),
  
  handleValidationErrors
];

const validateJobApplication = [
  body('coverLetter')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Cover letter must not exceed 1000 characters')
    .trim(),
  
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateJob,
  validateJobApplication,
  handleValidationErrors
};
