# Job Board Backend Tests

This directory contains comprehensive unit and integration tests for the Job Board backend API using Jest and Supertest.

## Test Structure

```
tests/
├── setup.js                 # Jest configuration and global setup
├── helpers/                 # Test helper utilities
│   ├── dbHelper.js          # Database setup and teardown functions
│   └── testData.js          # Mock data and token generators
├── unit/                    # Unit tests for individual modules
│   ├── authController.test.js
│   ├── jobController.test.js
│   ├── userController.test.js
│   ├── authMiddleware.test.js
│   ├── adminMiddleware.test.js
│   └── errorMiddleware.test.js
├── integration/             # Integration tests for API endpoints
│   ├── authRoutes.test.js
│   ├── jobRoutes.test.js
│   ├── userRoutes.test.js
│   └── server.test.js
└── runTests.js              # Test runner script
```

## Test Coverage

### Unit Tests
- **Controllers**: Auth, Job, User controllers with mocked database
- **Middleware**: Authentication, authorization, and error handling
- **Database operations**: Mocked SQLite operations

### Integration Tests
- **API Endpoints**: Complete request/response cycle testing
- **Authentication flows**: Login, registration, token validation
- **Authorization**: Admin-only routes protection
- **Error handling**: 400, 401, 403, 404, 500 responses
- **CORS and Security**: Headers and middleware testing

## Test Features

### Database Testing
- In-memory SQLite database for fast tests
- Automated schema setup and seeding
- Proper cleanup after tests
- Isolated test data for each test suite

### Authentication Testing
- JWT token generation and validation
- Password hashing verification
- Role-based access control
- Token expiration handling

### Mock Data
- Realistic user, job, and application data
- Valid and invalid input scenarios
- Edge cases and error conditions

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test Files
```bash
# Unit tests only
npx jest tests/unit/

# Integration tests only
npx jest tests/integration/

# Specific test file
npx jest tests/unit/authController.test.js
```

## Test Environment

### Environment Variables
Tests automatically set the following environment variables:
- `NODE_ENV=test`
- `JWT_SECRET=test-secret-key`
- `PORT=3002`

### Mocking Strategy
- Database operations are mocked using Jest mocks
- External dependencies are mocked appropriately
- Console output is suppressed during tests for cleaner output

### Test Data
Helper functions provide:
- Mock users (regular user and admin)
- JWT tokens for authentication
- Sample job postings and applications
- Database seed data

## Test Scenarios Covered

### Authentication & Authorization
- ✅ User registration with valid/invalid data
- ✅ User login with correct/incorrect credentials
- ✅ JWT token generation and verification
- ✅ Protected route access with/without tokens
- ✅ Admin-only route protection
- ✅ Token expiration handling

### Job Management
- ✅ Public job listing with pagination and filtering
- ✅ Job creation by admin users
- ✅ Job updates and archiving
- ✅ Job search functionality
- ✅ Error handling for non-existent jobs

### User Management
- ✅ User listing (admin only)
- ✅ User promotion to admin
- ✅ Access control validation

### Application Management
- ✅ Job application submission
- ✅ Application status updates
- ✅ Application listing by job/admin
- ✅ File upload validation (mocked)

### Error Handling
- ✅ Database errors
- ✅ Validation errors
- ✅ Authentication errors
- ✅ Authorization errors
- ✅ 404 handling for non-existent routes
- ✅ Proper error response formats

## CI/CD Integration

These tests are designed to run in CI/CD environments:
- No external database dependencies
- Fast execution with in-memory database
- Comprehensive coverage reporting
- Exit codes for build pipeline integration

## Test Maintenance

### Adding New Tests
1. Follow existing patterns for mocking and setup
2. Use appropriate test helpers for database and authentication
3. Include both success and error scenarios
4. Test edge cases and validation

### Updating Tests
When modifying the API:
1. Update corresponding test files
2. Maintain test data consistency
3. Verify coverage remains comprehensive
4. Update mocks to match new implementations

## Coverage Goals

Target coverage metrics:
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

Current coverage can be viewed by running `npm run test:coverage`.
