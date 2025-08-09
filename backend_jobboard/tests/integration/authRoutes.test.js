const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');
const { createTestDB, initTestDB, seedTestDB, cleanupTestDB } = require('../helpers/dbHelper');

// Mock the database module
jest.mock('../../db/database');
const db = require('../../db/database');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

describe('Auth Routes Integration', () => {
  let app, testDB;

  beforeAll(async () => {
    testDB = createTestDB();
    await initTestDB(testDB);
    await seedTestDB(testDB);
    app = createTestApp();
  });

  afterAll(async () => {
    await cleanupTestDB(testDB);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Mock successful database insertion
      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 3 }, null);
      });

      const userData = {
        username: 'newuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        id: 3,
        username: 'newuser',
        role: 'user'
      });
    });

    it('should return 400 for missing username', async () => {
      const userData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Please provide username and password');
    });

    it('should return 400 for missing password', async () => {
      const userData = {
        username: 'newuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Please provide username and password');
    });

    it('should return 400 for existing username', async () => {
      // Mock database error for duplicate username
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('UNIQUE constraint failed'));
      });

      const userData = {
        username: 'existinguser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Username already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('password123', 10);
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: hashedPassword,
        role: 'user'
      };

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        id: 1,
        username: 'testuser',
        role: 'user'
      });
    });

    it('should return 401 for invalid username', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('password123', 10);
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: hashedPassword,
        role: 'user'
      };

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
