const request = require('supertest');
const express = require('express');
const jobRoutes = require('../../src/routes/jobRoutes');
const { createUserToken, createAdminToken, mockJobs } = require('../helpers/testData');
const { createTestDB, initTestDB, seedTestDB, cleanupTestDB } = require('../helpers/dbHelper');

// Mock the database module
jest.mock('../../db/database');
const db = require('../../db/database');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/jobs', jobRoutes);
  return app;
};

describe('Job Routes Integration', () => {
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

  describe('GET /api/jobs', () => {
    it('should get all jobs (public route)', async () => {
      const mockJobsData = [
        { id: 1, title: 'Software Developer', is_archived: 0 },
        { id: 2, title: 'Marketing Manager', is_archived: 0 }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockJobsData);
      });

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, { count: 2 });
      });

      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
      expect(response.body.data).toEqual(mockJobsData);
    });

    it('should filter jobs by search term', async () => {
      const mockJobsData = [
        { id: 1, title: 'Software Developer', is_archived: 0 }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockJobsData);
      });

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, { count: 1 });
      });

      const response = await request(app)
        .get('/api/jobs?search=developer')
        .expect(200);

      expect(response.body.data).toEqual(mockJobsData);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should get a job by ID (public route)', async () => {
      const mockJob = { id: 1, title: 'Software Developer', is_archived: 0 };

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockJob);
      });

      const response = await request(app)
        .get('/api/jobs/1')
        .expect(200);

      expect(response.body).toEqual(mockJob);
    });

    it('should return 404 for non-existent job', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/jobs/999')
        .expect(404);

      expect(response.body.message).toBe('Job not found or has been archived');
    });
  });

  describe('POST /api/jobs (Admin only)', () => {
    it('should create a job with admin token', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockJobs.valid)
        .expect(201);

      expect(response.body).toEqual({ id: 1 });
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send(mockJobs.valid)
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockJobs.valid)
        .expect(403);

      expect(response.body.message).toBe('Not authorized as an admin');
    });
  });

  describe('PUT /api/jobs/:id (Admin only)', () => {
    it('should update a job with admin token', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({}, null);
      });

      const response = await request(app)
        .put('/api/jobs/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockJobs.update)
        .expect(200);

      expect(response.body.message).toBe('Job 1 updated successfully');
    });
  });

  describe('DELETE /api/jobs/:id (Admin only)', () => {
    it('should archive a job with admin token', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({}, null);
      });

      const response = await request(app)
        .delete('/api/jobs/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Job 1 archived successfully');
    });
  });

  describe('GET /api/jobs/admin/all (Admin only)', () => {
    it('should get all jobs including archived with admin token', async () => {
      const mockAllJobs = [
        { id: 1, title: 'Active Job', is_archived: 0 },
        { id: 2, title: 'Archived Job', is_archived: 1 }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockAllJobs);
      });

      const response = await request(app)
        .get('/api/jobs/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual(mockAllJobs);
    });
  });

  describe('GET /api/jobs/:id/applications (Admin only)', () => {
    it('should get applications for a job with admin token', async () => {
      const mockApplications = [
        {
          id: 1,
          status: 'pending',
          username: 'testuser',
          cover_letter: 'Cover letter',
          cv_url: '/uploads/cvs/test.pdf'
        }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      const response = await request(app)
        .get('/api/jobs/1/applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual(mockApplications);
    });
  });

  describe('PUT /api/jobs/applications/:appId (Admin only)', () => {
    it('should update application status with admin token', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({}, null);
      });

      const response = await request(app)
        .put('/api/jobs/applications/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'accepted' })
        .expect(200);

      expect(response.body.message).toBe('Application 1 status updated to accepted');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/jobs/applications/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.message).toBe('Invalid status');
    });
  });
});
