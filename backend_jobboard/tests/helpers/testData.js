const jwt = require('jsonwebtoken');

// Generate test JWT tokens
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Create test user tokens
const createUserToken = (userId = 1, role = 'user') => {
  return generateToken({ id: userId, role });
};

const createAdminToken = (userId = 2, role = 'admin') => {
  return generateToken({ id: userId, role });
};

// Mock user data
const mockUsers = {
  user: {
    id: 1,
    username: 'testuser',
    role: 'user'
  },
  admin: {
    id: 2,
    username: 'admin',
    role: 'admin'
  }
};

// Mock job data
const mockJobs = {
  valid: {
    title: 'Test Job',
    company_name: 'Test Company',
    company_description: 'A test company',
    job_description: 'A test job description',
    location: 'Test City',
    requirements: 'Test requirements',
    salary: '$50,000',
    tags: 'test,job',
    deadline: '2024-12-31'
  },
  update: {
    title: 'Updated Job',
    company_name: 'Updated Company',
    company_description: 'An updated company',
    job_description: 'An updated job description',
    location: 'Updated City',
    requirements: 'Updated requirements',
    salary: '$60,000',
    tags: 'updated,test',
    deadline: '2025-01-31'
  }
};

// Mock application data
const mockApplication = {
  cover_letter: 'This is a test cover letter for the job application.',
  // Note: cv_file will be handled separately in tests using multer
};

module.exports = {
  generateToken,
  createUserToken,
  createAdminToken,
  mockUsers,
  mockJobs,
  mockApplication
};
