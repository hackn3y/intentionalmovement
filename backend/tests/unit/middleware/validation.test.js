const {
  validateUserRegistration,
  validateUserLogin,
  validateEmail
} = require('../../../src/middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateUserRegistration', () => {
    it('should pass with valid registration data', () => {
      req.body = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'ValidPass123!',
        displayName: 'Valid User'
      };

      validateUserRegistration(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with short username', () => {
      req.body = {
        username: 'ab',
        email: 'test@example.com',
        password: 'ValidPass123!'
      };

      validateUserRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with invalid email', () => {
      req.body = {
        username: 'validuser',
        email: 'invalid-email',
        password: 'ValidPass123!'
      };

      validateUserRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with weak password', () => {
      req.body = {
        username: 'validuser',
        email: 'valid@example.com',
        password: '123'
      };

      validateUserRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUserLogin', () => {
    it('should pass with valid login credentials', () => {
      req.body = {
        emailOrUsername: 'testuser',
        password: 'password123'
      };

      validateUserLogin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail without email/username', () => {
      req.body = { password: 'password123' };

      validateUserLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail without password', () => {
      req.body = { emailOrUsername: 'testuser' };

      validateUserLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateEmail', () => {
    it('should pass with valid email', () => {
      req.body = { email: 'test@example.com' };

      validateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with invalid email', () => {
      req.body = { email: 'not-an-email' };

      validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with missing email', () => {
      req.body = {};

      validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
