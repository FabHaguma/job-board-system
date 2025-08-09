const { protect } = require('../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect', () => {
    it('should authenticate user with valid token', () => {
      mockReq.headers.authorization = 'Bearer valid-token';

      const mockDecoded = { id: 1, role: 'user' };
      jwt.verify.mockReturnValue(mockDecoded);

      protect(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(mockReq.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 for missing authorization header', () => {
      protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized, no token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid authorization format', () => {
      mockReq.headers.authorization = 'Invalid format';

      protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized, no token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized, token failed'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', () => {
      mockReq.headers.authorization = 'Bearer expired-token';

      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized, token failed'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
