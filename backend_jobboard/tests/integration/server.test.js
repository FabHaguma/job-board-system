const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('../../src/routes/authRoutes');
const jobRoutes = require('../../src/routes/jobRoutes');
const userRoutes = require('../../src/routes/userRoutes');
const { errorHandler, notFound } = require('../../src/middleware/errorMiddleware');
const { createTestDB, initTestDB, seedTestDB, cleanupTestDB } = require('../helpers/dbHelper');
const { createUserToken, createAdminToken } = require('../helpers/testData');

// Mock the database module
jest.mock('../../db/database');
const db = require('../../db/database');

// Create test app (similar to server.js but without starting the server)
const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/uploads', express.static(path.join(__dirname, '../..', 'uploads')));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/users', userRoutes);

  app.get('/', (req, res) => {
    res.send('Job Board API is running...');
  });

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

describe('Server Integration Tests', () => {
  let app, testDB, userToken, adminToken;

  beforeAll(async () => {
    testDB = createTestDB();
    await initTestDB(testDB);
    await seedTestDB(testDB);
    app = createTestApp();
    userToken = createUserToken();
    adminToken = createAdminToken();
  });

  afterAll(async () => {
    await cleanupTestDB(testDB);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Health', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('Job Board API is running...');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('API Workflow Integration', () => {
    it('should handle complete user registration and login flow', async () => {
      // Mock user registration
      db.run.mockImplementationOnce((sql, params, callback) => {
        callback.call({ lastID: 3 }, null);
      });

      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'integrationuser',
          password: 'password123'
        })
        .expect(201);

      expect(registerResponse.body).toEqual({
        id: 3,
        username: 'integrationuser',
        role: 'user'
      });

      // Mock user login
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('password123', 10);
      
      const mockUser = {
        id: 3,
        username: 'integrationuser',
        password_hash: hashedPassword,
        role: 'user'
      };

      db.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, mockUser);
      });

      // Login user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'integrationuser',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.user).toEqual({
        id: 3,
        username: 'integrationuser',
        role: 'user'
      });
    });

    it('should handle complete job management workflow by admin', async () => {
      // Create job
      db.run.mockImplementationOnce((sql, params, callback) => {
        callback.call({ lastID: 3 }, null);
      });

      const jobData = {
        title: 'Integration Test Job',
        company_name: 'Test Company',
        company_description: 'A test company',
        job_description: 'A test job',
        location: 'Test City',
        requirements: 'Test requirements',
        salary: '$50,000',
        tags: 'test,integration',
        deadline: '2024-12-31'
      };

      const createResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(jobData)
        .expect(201);

      expect(createResponse.body).toEqual({ id: 3 });

      // Update job
      db.run.mockImplementationOnce((sql, params, callback) => {
        callback.call({}, null);
      });

      const updateData = { ...jobData, title: 'Updated Integration Test Job' };

      const updateResponse = await request(app)
        .put('/api/jobs/3')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.message).toBe('Job 3 updated successfully');

      // Archive job
      db.run.mockImplementationOnce((sql, params, callback) => {
        callback.call({}, null);
      });

      const archiveResponse = await request(app)
        .delete('/api/jobs/3')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(archiveResponse.body.message).toBe('Job 3 archived successfully');
    });

    it('should handle user promotion workflow', async () => {
      // Get all users
      const mockUsers = [
        { id: 1, username: 'testuser', role: 'user' },
        { id: 2, username: 'admin', role: 'admin' }
      ];

      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, mockUsers);
      });

      const getUsersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(getUsersResponse.body).toEqual(mockUsers);

      // Promote user
      db.run.mockImplementationOnce((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const promoteResponse = await request(app)
        .put('/api/users/1/promote')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(promoteResponse.body.message).toBe('User 1 has been promoted to admin.');
    });
  });
describe('Additional Authentication & Authorization Tests', () => {
  it('should reject login with invalid password', async () => {
    const hashedPassword = bcrypt.hashSync('correctpassword', 10);
    const mockUser = { id: 9, username: 'badlogin', password_hash: hashedPassword, role: 'user' };
    db.get.mockImplementationOnce((sql, params, cb) => cb(null, mockUser));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'badlogin', password: 'wrongpassword' })
      .expect(status => {
        if (![400, 401].includes(status)) throw new Error('Expected 400 or 401');
      });

    expect(res.body).toHaveProperty('error');
  });

  it('should deny access to admin route without token', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect(status => {
        if (![401, 403].includes(status)) throw new Error('Expected 401 or 403');
      });

    expect(res.body).toHaveProperty('error');
  });

  it('should forbid non-admin user from creating a job', async () => {
    const jobData = {
      title: 'Unauthorized Job',
      company_name: 'Company',
      company_description: 'Desc',
      job_description: 'Job desc',
      location: 'City',
      requirements: 'Reqs',
      salary: '$10',
      tags: 'tag',
      deadline: '2030-01-01'
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .send(jobData)
      .expect(status => {
        if (![401, 403].includes(status)) throw new Error('Expected 401 or 403');
      });

    expect(res.body).toHaveProperty('error');
  });
});

describe('Data Fetching Tests', () => {
  it('should fetch list of jobs', async () => {
    const mockJobs = [
      { id: 1, title: 'Job A', company_name: 'Comp A', archived: 0 },
      { id: 2, title: 'Job B', company_name: 'Comp B', archived: 0 }
    ];
    db.all.mockImplementationOnce((sql, params, cb) => cb(null, mockJobs));

    const res = await request(app)
      .get('/api/jobs')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('title');
  });

  it('should fetch a single job by id', async () => {
    const mockJob = { id: 1, title: 'Single Job', company_name: 'Comp', job_description: 'Desc', archived: 0 };
    db.get.mockImplementationOnce((sql, params, cb) => cb(null, mockJob));

    const res = await request(app)
      .get('/api/jobs/1')
      .expect(200);

    expect(res.body).toMatchObject({ id: 1, title: 'Single Job' });
  });

  it('should return 404 when job not found', async () => {
    db.get.mockImplementationOnce((sql, params, cb) => cb(null, null));

    const res = await request(app)
      .get('/api/jobs/9999')
      .expect(404);

    expect(res.body).toHaveProperty('error');
  });
});

describe('Job Application Submission Tests', () => {
  it('should submit a job application successfully', async () => {
    // Mock job existence check
    const mockJob = { id: 4, title: 'Apply Job', archived: 0 };
    db.get
      .mockImplementationOnce((sql, params, cb) => cb(null, mockJob)); // For job fetch/validation

    // Mock application insert
    db.run.mockImplementationOnce(function (sql, params, cb) {
      cb.call({ lastID: 11 }, null);
    });

    const res = await request(app)
      .post('/api/jobs/4/apply')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        applicant_name: 'Test User',
        email: 'test@example.com',
        resume: 'My resume content'
      })
      .expect(status => {
        if (![200, 201].includes(status)) throw new Error('Expected 200 or 201');
      });

    expect(res.body).toHaveProperty('message');
  });

  it('should return 404 when applying to non-existent job', async () => {
    db.get.mockImplementationOnce((sql, params, cb) => cb(null, null));

    const res = await request(app)
      .post('/api/jobs/12345/apply')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        applicant_name: 'Test User',
        email: 'test@example.com',
        resume: 'Resume'
      })
      .expect(404);

    expect(res.body).toHaveProperty('error');
  });
});

describe('Duplicate Registration Edge Case', () => {
  it('should handle duplicate username registration attempt', async () => {
    db.run.mockImplementationOnce((sql, params, cb) => cb({ message: 'UNIQUE constraint failed: users.username' }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'existinguser', password: 'password123' })
      .expect(status => {
        if (status < 400) throw new Error('Expected failure status');
      });

    expect(res.body).toHaveProperty('error');
  });
});
});
