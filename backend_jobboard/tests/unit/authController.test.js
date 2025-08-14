const { registerUser, loginUser } = require('../../src/controllers/authController');
const { createTestDB, initTestDB, cleanupTestDB } = require('../helpers/dbHelper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the database module
jest.mock('../../db/database');
const db = require('../../db/database');

describe('Auth Controller', () => {
  let mockReq, mockRes, testDB;

  beforeAll(async () => {
    testDB = createTestDB();
    await initTestDB(testDB);
  });

  afterAll(async () => {
    await cleanupTestDB(testDB);
  });

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully and return token + user', () => {
      mockReq.body = {
        username: 'newuser',
        password: 'password123'
      };

      // Mock successful database insertion
      db.run.mockImplementation((sql, params, callback) => {
        // Simulate successful insertion
        callback.call({ lastID: 1 }, null);
      });

      // Mock JWT sign
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      registerUser(mockReq, mockRes);

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        expect.arrayContaining(['newuser', expect.any(String), 'user']),
        expect.any(Function)
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'newuser',
          role: 'user'
        }
      });
    });

    it('should return 400 if username is missing', () => {
      mockReq.body = {
        password: 'password123'
      };

      registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Please provide username and password'
      });
      expect(db.run).not.toHaveBeenCalled();
    });

    it('should return 400 if password is missing', () => {
      mockReq.body = {
        username: 'newuser'
      };

      registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Please provide username and password'
      });
      expect(db.run).not.toHaveBeenCalled();
    });

    it('should return 400 if username already exists', () => {
      mockReq.body = {
        username: 'existinguser',
        password: 'password123'
      };

      // Mock database error (username already exists)
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('UNIQUE constraint failed'));
      });

      registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Username already exists'
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid credentials', () => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      };

      const hashedPassword = bcrypt.hashSync('password123', 10);
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: hashedPassword,
        role: 'user'
      };

      // Mock successful database query
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      // Mock JWT sign
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      loginUser(mockReq, mockRes);

      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['testuser'],
        expect.any(Function)
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'user'
        }
      });
    });

    it('should return 401 for invalid username', () => {
      mockReq.body = {
        username: 'nonexistent',
        password: 'password123'
      };

      // Mock database query returning no user
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 for invalid password', () => {
      mockReq.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const hashedPassword = bcrypt.hashSync('password123', 10);
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: hashedPassword,
        role: 'user'
      };

      // Mock successful database query
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockUser);
      });

      loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 for database error', () => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      };

      // Mock database error
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
  });
});
