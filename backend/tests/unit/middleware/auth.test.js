const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      header: jest.fn((name) => req.headers[name.toLowerCase()])
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('verifyToken', () => {
    it('should fail when no token is provided', () => {
      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should succeed with valid token', () => {
      const payload = { id: 123, username: 'testuser' };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      verifyToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(123);
      expect(req.user.username).toBe('testuser');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should extract token from Authorization header', () => {
      const payload = { id: 456 };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      verifyToken(req, res, next);

      expect(req.user.id).toBe(456);
      expect(next).toHaveBeenCalled();
    });
  });
});
