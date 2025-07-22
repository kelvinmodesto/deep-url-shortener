# URL Shortener API Server

A modern, scalable URL shortening service built with Node.js, TypeScript, Express, and MongoDB.

## Features

- ✅ Create short URLs with custom codes
- ✅ URL expiration support
- ✅ Click tracking and analytics
- ✅ Tag-based organization
- ✅ Rate limiting protection
- ✅ Comprehensive validation
- ✅ Full TypeScript support
- ✅ Complete test suite
- ✅ RESTful API design
- ✅ Error handling and logging
- ✅ Docker support
- ✅ Security best practices

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Validation**: Joi
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier
- **Security**: Helmet + CORS

## Prerequisites

- Node.js 18+
- MongoDB 6+
- Yarn 4+

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/url-shortener
MONGODB_DB_NAME=url-shortener

# URL Configuration
BASE_URL=http://localhost:3000
SHORT_URL_LENGTH=6

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Using MongoDB service (Linux/macOS)
sudo systemctl start mongod

# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Using MongoDB Atlas (cloud)
# Use the connection string from your Atlas cluster
```

### 4. Development Server

Start the development server with hot reloading:

```bash
yarn dev
```

The server will start at `http://localhost:3000`

## Available Scripts

```bash
# Development
yarn dev          # Start development server with hot reload
yarn build        # Build TypeScript to JavaScript
yarn start        # Start production server

# Testing
yarn test         # Run test suite
yarn test:watch   # Run tests in watch mode
yarn test:coverage # Run tests with coverage report

# Code Quality
yarn lint         # Run ESLint
yarn lint:fix     # Fix ESLint issues automatically
yarn format      # Format code with Prettier
yarn format:check # Check code formatting

# Utilities
yarn clean        # Remove build artifacts
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Currently, the API is open and doesn't require authentication. User ID can be passed for user-specific operations.

### Endpoints

#### Create Short URL
```http
POST /api/urls
Content-Type: application/json

{
  "originalUrl": "https://example.com",
  "customCode": "optional-custom-code",
  "description": "Optional description",
  "tags": ["tag1", "tag2"],
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com",
    "shortUrl": "http://localhost:3000/abc123",
    "shortCode": "abc123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Short URL created successfully"
}
```

#### Redirect to Original URL
```http
GET /:shortCode
```

Returns a 301 redirect to the original URL and increments click count.

#### Get URL Details
```http
GET /api/urls/details/:shortCode
```

#### Get URL Statistics
```http
GET /api/urls/stats/:shortCode
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "totalClicks": 42,
    "clicksByDay": [
      { "_id": "2024-01-01", "clicks": 15 },
      { "_id": "2024-01-02", "clicks": 27 }
    ],
    "recentClicks": []
  }
}
```

#### Get User URLs
```http
GET /api/urls/my-urls?page=1&limit=10&search=github&tags=work
```

#### Get Top URLs
```http
GET /api/urls/top?limit=10
```

#### Update URL
```http
PUT /api/urls/:id
Content-Type: application/json

{
  "description": "Updated description",
  "tags": ["updated", "tags"],
  "isActive": true
}
```

#### Delete URL
```http
DELETE /api/urls/:id
```

#### Deactivate URL
```http
PATCH /api/urls/:id/deactivate
```

### Health Checks

#### Health Status
```http
GET /health
```

#### Ping
```http
GET /ping
```

#### API Information
```http
GET /info
```

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch

# Run specific test file
yarn test src/tests/services/urlService.test.ts
```

### Test Structure

```
src/tests/
├── setup.ts                    # Global test setup
├── services/
│   └── urlService.test.ts     # Service layer tests
└── integration/
    └── url.test.ts            # API integration tests
```

### Test Coverage

The test suite includes:
- Unit tests for services
- Integration tests for API endpoints
- Validation tests
- Error handling tests
- Database interaction tests

## Deployment

### Production Build

```bash
# Build the application
yarn build

# Start production server
yarn start
```

### Environment Variables

Ensure these environment variables are set in production:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db/url-shortener
BASE_URL=https://your-domain.com
```

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
```

Build and run:

```bash
docker build -t url-shortener .
docker run -p 3000:3000 -e MONGODB_URI=mongodb://host.docker.internal:27017/url-shortener url-shortener
```

## Performance Considerations

### Database Indexing

The application automatically creates these indexes:
- `shortCode` (unique)
- `originalUrl`
- `createdAt`
- `userId`
- `isActive`
- `expiresAt` (TTL index)
- `tags`

### Rate Limiting

Configure rate limiting in your environment:

```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # 100 requests per window
```


## Security

The application implements several security measures:

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Secure error responses
- **Environment Variables**: Sensitive data protection

## Monitoring and Logging

### Request Logging

All requests are logged with:
- HTTP method and path
- Response status code
- Response time
- User agent and IP (for analytics)

### Error Logging

Errors are logged with:
- Error message and stack trace
- Request context
- Timestamp and severity level

### Health Monitoring

Use the health endpoints for monitoring:
- `/ping` - Basic connectivity check
- `/health` - Detailed health status
- `/info` - API information and version

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run the test suite: `yarn test`
5. Check code quality: `yarn lint && yarn format:check`
6. Commit changes: `git commit -m 'Add new feature'`
7. Push to branch: `git push origin feature/new-feature`
8. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
- Create an issue on GitHub
- Check the API documentation at `/info`
- Review the test files for usage examples

---

**Built with ❤️ using TypeScript, Express.js, and MongoDB**
