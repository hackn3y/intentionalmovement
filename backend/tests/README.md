# Backend Testing Guide

## Overview

This directory contains all tests for the Intentional Movement Corp backend API.

## Test Structure

```
tests/
├── setup.js              # Global test configuration
├── fixtures/             # Test data and mocks
│   └── testData.js      # Common test data
├── unit/                # Unit tests
│   ├── controllers/     # Controller tests
│   ├── middleware/      # Middleware tests
│   │   ├── auth.test.js
│   │   ├── validation.test.js
│   │   └── errorHandler.test.js
│   ├── services/        # Service tests
│   │   └── mailchimpService.test.js
│   └── utils/           # Utility tests
│       └── logger.test.js
└── integration/         # Integration tests
    └── health.test.js   # Health check tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npx jest tests/unit/middleware/auth.test.js
```

### Run Tests in Watch Mode
```bash
npx jest --watch
```

### Run Tests Matching Pattern
```bash
npx jest --testNamePattern="Auth"
```

## Test Coverage Goals

- **Overall**: 70% minimum
- **Critical Paths**: 90%+ (auth, payments, user management)
- **Utilities**: 60%+

### Current Coverage

Run `npm test -- --coverage` to see current coverage.

Target thresholds (set in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Writing New Tests

### Unit Test Template

```javascript
describe('Feature Name', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('method name', () => {
    it('should do something', () => {
      // Arrange
      req.body = { test: 'data' };

      // Act
      someFunction(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });
});
```

### Integration Test Template

```javascript
const request = require('supertest');
const app = require('../../src/server');

describe('API Endpoint', () => {
  it('should return expected response', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

## Test Priorities

### Critical (Must Test)
1. Authentication (login, register, JWT verification)
2. Authorization (role checks, permissions)
3. Payment processing (Stripe integration)
4. User data security (password hashing, PII protection)
5. Input validation (SQL injection, XSS prevention)

### High Priority
1. CRUD operations (Posts, Programs, Users)
2. Rate limiting
3. Error handling
4. Database operations
5. File uploads

### Medium Priority
1. Analytics tracking
2. Email notifications
3. Search functionality
4. Pagination
5. Sorting and filtering

## Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external services (Stripe, Mailchimp, Firebase)
3. **Cleanup**: Clean up test data after each test
4. **Descriptive Names**: Use clear, descriptive test names
5. **AAA Pattern**: Arrange, Act, Assert

## Environment Variables

Tests use `.env.test` file. Create it with:

```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-testing-only
DATABASE_URL=sqlite::memory:
```

## Common Issues

### Database Connection
- Tests use in-memory SQLite by default
- No cleanup needed between tests
- Fast execution

### Rate Limiting
- May need to disable in tests
- Mock or increase limits

### Authentication
- Generate test JWT tokens using `jwt.sign()`
- Use test user fixtures

## Next Steps

### Immediate
- [ ] Add authentication controller tests
- [ ] Add posts controller tests
- [ ] Add programs controller tests

### Short Term
- [ ] Add database model tests
- [ ] Add integration tests for critical flows
- [ ] Increase coverage to 70%

### Long Term
- [ ] Add E2E tests
- [ ] Add performance tests
- [ ] Add security tests (penetration testing)

## CI/CD Integration

Tests run automatically on:
- Git push (via GitHub Actions)
- Pull requests
- Pre-deployment checks

Configure in `.github/workflows/test.yml`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
