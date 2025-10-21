const errorHandler = require('../../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      requestId: 'test-request-id',
      url: '/test',
      method: 'GET'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should handle generic errors with 500 status', () => {
    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String)
      })
    );
  });

  it('should use error status code if provided', () => {
    const error = new Error('Not found');
    error.statusCode = 404;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should include request ID in response', () => {
    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'test-request-id'
      })
    );
  });

  it('should not leak stack trace in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Test error');
    errorHandler(error, req, res, next);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  it('should include stack trace in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Test error');
    errorHandler(error, req, res, next);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.stack).toBeDefined();

    process.env.NODE_ENV = originalEnv;
  });
});
