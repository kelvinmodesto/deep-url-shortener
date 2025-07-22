# URL Shortener - Complete Development Environment

A modern, scalable URL shortening service built with Node.js, TypeScript, Express, and MongoDB. This project includes a complete development environment with Docker Compose for easy setup.

## 🚀 Quick Start with Docker

The fastest way to get started is using Docker Compose, which will set up MongoDB, and optional database management UI for you.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd url-shortener

# Make the Docker helper script executable
chmod +x scripts/docker-dev.sh
```

### 2. Start Development Environment

```bash
# Start MongoDB
./scripts/docker-dev.sh start

# OR start with database management UI
./scripts/docker-dev.sh start-ui
```

### 3. Install and Run API Server

```bash
cd server
npm install
npm run dev
```

### 4. Test Your Setup

```bash
# Health check
curl http://localhost:3000/ping

# Create your first short URL
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://github.com"}'

# Test the redirect (replace 'abc123' with the actual short code from above)
curl -I http://localhost:3000/abc123
```

## 📊 Service Information

Once started, you'll have access to:

| Service | URL | Credentials |
|---------|-----|-------------|
| **API Server** | http://localhost:3000 | - |
| **MongoDB** | localhost:27017 | `urlshortener:urlshortener123` |
| **Mongo Express** | http://localhost:8081 | `admin:admin123` |

## 🛠️ Docker Management Commands

Use the helpful Docker management script:

```bash
# Start services
./scripts/docker-dev.sh start              # MongoDB
./scripts/docker-dev.sh start-ui           # + Mongo Express UI

# Manage services
./scripts/docker-dev.sh status             # Check service health
./scripts/docker-dev.sh stop               # Stop all services
./scripts/docker-dev.sh restart            # Restart services
./scripts/docker-dev.sh logs               # View all logs
./scripts/docker-dev.sh logs mongodb       # View specific service logs

# Database access
./scripts/docker-dev.sh mongo              # MongoDB shell

# Backup and restore
./scripts/docker-dev.sh backup             # Create database backup
./scripts/docker-dev.sh restore backup.archive  # Restore from backup

# Cleanup
./scripts/docker-dev.sh cleanup            # Remove containers and volumes
```

## 🏗️ Project Structure

```
url-shortener/
├── docker-compose.yml          # Docker services configuration
├── scripts/
│   ├── docker-dev.sh           # Docker management helper
│   └── mongo-init.js           # MongoDB initialization
├── server/                     # API server code
│   ├── src/
│   │   ├── app.ts              # Express application
│   │   ├── config/             # Configuration management
│   │   ├── controllers/        # Route handlers
│   │   ├── database/           # Database connection
│   │   ├── middleware/         # Custom middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── tests/              # Test suites
│   │   ├── types/              # TypeScript types
│   │   └── validators/         # Input validation
│   ├── package.json            # Dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── jest.config.js          # Test configuration
│   └── .env                    # Environment variables
└── client/                     # Frontend (future implementation)
```

## 🎯 API Endpoints

### Core Operations
```bash
# Create short URL
POST /api/urls
{
  "originalUrl": "https://example.com",
  "customCode": "optional-custom-code",
  "description": "Optional description",
  "tags": ["tag1", "tag2"],
  "expiresAt": "2024-12-31T23:59:59.000Z"
}

# Redirect to original URL
GET /:shortCode

# Get URL details
GET /api/urls/details/:shortCode

# Get URL statistics
GET /api/urls/stats/:shortCode

# List URLs with filtering
GET /api/urls/my-urls?page=1&limit=10&search=github&tags=work

# Get top URLs by clicks
GET /api/urls/top?limit=10

# Update URL
PUT /api/urls/:id
{
  "description": "Updated description",
  "tags": ["new", "tags"]
}

# Delete URL
DELETE /api/urls/:id
```

### System Endpoints
```bash
GET /health                     # Detailed health check
GET /ping                       # Simple ping
GET /info                       # API information
```

## 🔧 Development Workflow

### Starting Development

```bash
# 1. Start infrastructure
./scripts/docker-dev.sh start-ui

# 2. Start API server
cd server
npm run dev

# 3. Run tests (in another terminal)
npm test

# 4. Check code quality
npm run lint
npm run format
```

### Working with the Database

```bash
# Access MongoDB shell
./scripts/docker-dev.sh mongo

# View sample data
db.urls.find().pretty()

# Check indexes
db.urls.getIndexes()

```

### Monitoring and Debugging

```bash
# View service status
./scripts/docker-dev.sh status

# Watch logs
./scripts/docker-dev.sh logs

# Monitor specific service
./scripts/docker-dev.sh logs mongodb
docker-compose logs -f mongodb
```

## 🗄️ Database Schema

### URL Document
```javascript
{
  _id: ObjectId,
  originalUrl: String,           // Required: Original URL
  shortCode: String,             // Required: Unique short code
  shortUrl: String,              // Required: Full short URL
  clicks: Number,                // Required: Click count
  createdAt: Date,               // Required: Creation timestamp
  updatedAt: Date,               // Required: Last update timestamp
  isActive: Boolean,             // Required: Active status
  expiresAt: Date,               // Optional: Expiration date
  userId: String,                // Optional: User identifier
  description: String,           // Optional: URL description
  tags: [String],                // Optional: Tags array
  clickHistory: [{              // Optional: Click tracking
    timestamp: Date,
    userAgent: String,
    ip: String,
    referer: String,
    country: String,
    city: String
  }]
}
```

### Indexes Created
- `shortCode` (unique)
- `originalUrl`
- `createdAt`
- `userId`
- `isActive`
- `tags`
- `clicks` (descending)
- `expiresAt` (TTL index)
- Compound indexes for common queries

## 📊 Sample Data

The Docker setup includes sample URLs for testing:

- `http://localhost:3000/github` → GitHub
- `http://localhost:3000/stack` → Stack Overflow  
- `http://localhost:3000/mongodocs` → MongoDB Docs
- `http://localhost:3000/expired` → Expired URL (for testing)

## 🧪 Testing

```bash
cd server

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/tests/services/urlService.test.ts
```

## 🚀 Production Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
MONGODB_URI=mongodb://username:password@host:port/database
BASE_URL=https://yourdomain.com
CORS_ORIGIN=https://yourfrontend.com
```

### Docker Production Build

```bash
# Build production image
docker build -t url-shortener-api ./server

# Run with production database
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://prod-host:27017/url-shortener \
  -e NODE_ENV=production \
  url-shortener-api
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Secure error responses
- **Environment Variables**: Sensitive data protection

## 🔍 Monitoring and Analytics

- Request logging with response times
- Click tracking with user agent, IP, referer
- URL performance analytics
- Health check endpoints
- Database query optimization

## 📝 Environment Configuration

See `server/.env.example` for all available configuration options:

- Server settings (port, environment)
- Database connection (MongoDB URI, database name)
- URL settings (base URL, short code length)
- Security settings (CORS origin)
- Rate limiting configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Start development environment: `./scripts/docker-dev.sh start-ui`
4. Make changes and add tests
5. Run the test suite: `npm test`
6. Check code quality: `npm run lint && npm run format:check`
7. Commit changes: `git commit -m 'Add new feature'`
8. Push to branch: `git push origin feature/new-feature`
9. Submit a pull request

## 📚 Additional Resources

- [Server Documentation](./server/README.md) - Detailed API documentation
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🆘 Troubleshooting

### Common Issues

**Docker services won't start:**
```bash
# Check Docker is running
docker info

# Check for port conflicts
./scripts/docker-dev.sh status
```

**MongoDB connection issues:**
```bash
# Verify MongoDB is healthy
./scripts/docker-dev.sh status

# Check MongoDB logs
./scripts/docker-dev.sh logs mongodb
```

**API server connection issues:**
```bash
# Verify environment variables
cat server/.env

# Check API server logs
cd server && npm run dev
```

**Permission issues:**
```bash
# Make scripts executable
chmod +x scripts/docker-dev.sh
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using TypeScript, Express.js, MongoDB, and Docker**
