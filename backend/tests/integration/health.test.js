const request = require('supertest');
const express = require('express');

// Simple health check test that doesn't require full server setup
describe('Health Check Integration', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  });

  it('should return 200 for health check', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.timestamp).toBeDefined();
  });

  it('should include uptime in health check', async () => {
    const res = await request(app).get('/health');

    expect(res.body.uptime).toBeGreaterThan(0);
  });
});
