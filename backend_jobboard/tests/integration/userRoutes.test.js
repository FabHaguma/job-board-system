const request = require('supertest');
const express = require('express');
const userRoutes = require('../../src/routes/userRoutes');
const { createAdminToken, createUserToken } = require('../helpers/testData');
const { createTestDB, initTestDB, seedTestDB, cleanupTestDB } = require('../helpers/dbHelper');

// Mock the database module
jest.mock('../../db/database');
const db = require('../../db/database');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  return app;
};

describe('User Routes Integration', () => {
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

  describe('GET /api/users (Admin only)', () => {
    it('should get all users with admin token', async () => {
      const mockUsers = [
        { id: 1, username: 'testuser', role: 'user' },
        { id: 2, username: 'admin', role: 'admin' }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockUsers);
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual(mockUsers);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Not authorized as an admin');
    });

    it('should handle database error', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.message).toBe('Error fetching users');
    });
  });

  describe('PUT /api/users/:id/promote (Admin only)', () => {
    it('should promote user to admin with admin token', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app)
        .put('/api/users/1/promote')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('User 1 has been promoted to admin.');
    });

    it('should return 404 for non-existent user or already admin', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app)
        .put('/api/users/999/promote')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found or is already an admin.');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .put('/api/users/1/promote')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .put('/api/users/1/promote')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Not authorized as an admin');
    });

    it('should handle database error', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app)
        .put('/api/users/1/promote')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.message).toBe('Error promoting user');
    });
  });
});
