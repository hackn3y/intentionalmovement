const logger = require('../../../src/utils/logger');

describe('Logger Utility', () => {
  it('should have required logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should log info messages without errors', () => {
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  it('should log error messages without throwing', () => {
    expect(() => {
      logger.error('Test error message');
    }).not.toThrow();
  });

  it('should log warn messages', () => {
    expect(() => {
      logger.warn('Test warning message');
    }).not.toThrow();
  });

  it('should handle logging objects', () => {
    expect(() => {
      logger.info('Test with metadata', { userId: 123, action: 'test' });
    }).not.toThrow();
  });
});
