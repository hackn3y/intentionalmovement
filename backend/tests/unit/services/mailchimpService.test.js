const mailchimpService = require('../../../src/services/mailchimpService');

describe('Mailchimp Service', () => {
  describe('isConfigured', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return false when not configured', () => {
      delete process.env.MAILCHIMP_API_KEY;
      delete process.env.MAILCHIMP_LIST_ID;

      expect(mailchimpService.isConfigured()).toBe(false);
    });

    it('should return true when fully configured', () => {
      process.env.MAILCHIMP_API_KEY = 'test-api-key';
      process.env.MAILCHIMP_SERVER_PREFIX = 'us19';
      process.env.MAILCHIMP_LIST_ID = 'test-list-id';

      expect(mailchimpService.isConfigured()).toBe(true);
    });

    it('should return false when partially configured', () => {
      process.env.MAILCHIMP_API_KEY = 'test-api-key';
      delete process.env.MAILCHIMP_LIST_ID;

      expect(mailchimpService.isConfigured()).toBe(false);
    });
  });

  describe('subscribeUser', () => {
    it('should return early if not configured', async () => {
      const originalIsConfigured = mailchimpService.isConfigured;
      mailchimpService.isConfigured = jest.fn(() => false);

      const result = await mailchimpService.subscribeUser({
        email: 'test@example.com',
        firstName: 'Test'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');

      mailchimpService.isConfigured = originalIsConfigured;
    });

    it('should handle missing email', async () => {
      const result = await mailchimpService.subscribeUser({
        firstName: 'Test'
      });

      expect(result.success).toBe(false);
    });
  });
});
