const { getAllUsers, promoteUser } = require('../../src/controllers/userController');
const { createTestDB, initTestDB, cleanupTestDB } = require('../helpers/dbHelper');

// Mock the database module
jest.mock('../../db/database');
const db = require('../../db/database');

describe('User Controller', () => {
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
      body: {},
      params: {},
      user: { id: 2, role: 'admin' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', () => {
      const mockUsers = [
        { id: 1, username: 'testuser', role: 'user' },
        { id: 2, username: 'admin', role: 'admin' }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockUsers);
      });

      getAllUsers(mockReq, mockRes);

      expect(db.all).toHaveBeenCalledWith(
        'SELECT id, username, role FROM users',
        [],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle database error', () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error fetching users'
      });
    });
  });

  describe('promoteUser', () => {
    it('should promote user to admin successfully', () => {
      mockReq.params = { id: '1' };

      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      promoteUser(mockReq, mockRes);

      expect(db.run).toHaveBeenCalledWith(
        "UPDATE users SET role = 'admin' WHERE id = ? AND role = 'user'",
        ['1'],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User 1 has been promoted to admin.'
      });
    });

    it('should return 404 if user not found or already admin', () => {
      mockReq.params = { id: '999' };

      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      promoteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found or is already an admin.'
      });
    });

    it('should handle database error', () => {
      mockReq.params = { id: '1' };

      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      promoteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error promoting user'
      });
    });
  });
});
