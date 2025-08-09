const { admin } = require('../../src/middleware/adminMiddleware');

describe('Admin Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('admin', () => {
    it('should allow access for admin user', () => {
      mockReq.user = { id: 1, role: 'admin' };

      admin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for regular user', () => {
      mockReq.user = { id: 1, role: 'user' };

      admin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized as an admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when no user is set', () => {
      mockReq.user = null;

      admin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized as an admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user has no role', () => {
      mockReq.user = { id: 1 };

      admin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized as an admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
