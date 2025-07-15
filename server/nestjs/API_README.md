# URL Shortener API Documentation

A NestJS-based URL shortener service that provides REST API endpoints for creating, managing, and tracking shortened URLs.

## Features

- ✅ Create shortened URLs
- ✅ Redirect to original URLs
- ✅ Track click statistics
- ✅ CRUD operations for URLs
- ✅ MongoDB integration
- ✅ Input validation
- ✅ Error handling
- ✅ CORS enabled

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
DB_MONGO=mongodb
DB_HOST_MONGO=localhost
DB_PORT_MONGO=27017
DB_NAME_MONGO=url_shortener
DB_USER_MONGO=
DB_PASS_MONGO=
PORT=3000
```

4. Start the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### 1. Create Shortened URL

**POST** `/urls`

Creates a new shortened URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "msg": "URL shortened successfully",
  "addressId": "65a1b2c3d4e5f6789012345",
  "encodedUrl": "aBc123",
  "shortUrl": "http://localhost:3000/api/urls/redirect/aBc123"
}
```

### 2. Get All URLs

**GET** `/urls`

Retrieves all shortened URLs.

**Response:**
```json
[
  {
    "_id": "65a1b2c3d4e5f6789012345",
    "url": "https://example.com",
    "encodedUrl": "aBc123",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "clickCount": 5
  }
]
```

### 3. Get URL by ID

**GET** `/urls/:id`

Retrieves a specific URL by its ID.

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6789012345",
  "url": "https://example.com",
  "encodedUrl": "aBc123",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "clickCount": 5
}
```

### 4. Redirect to Original URL

**GET** `/urls/redirect/:encodedUrl`

Redirects to the original URL and increments click count.

**Example:**
```
GET /api/urls/redirect/aBc123
```

Redirects to the original URL with HTTP 301 status.

### 5. Get URL Statistics

**GET** `/urls/:id/stats`

Gets statistics for a specific URL.

**Response:**
```json
{
  "url": "https://example.com",
  "encodedUrl": "aBc123",
  "clickCount": 5,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:05:00.000Z"
}
```

### 6. Update URL

**PATCH** `/urls/:id`

Updates an existing URL.

**Request Body:**
```json
{
  "url": "https://updated-example.com"
}
```

**Response:**
```json
{
  "msg": "URL updated successfully"
}
```

### 7. Delete URL

**DELETE** `/urls/:id`

Deletes a URL.

**Response:**
```json
{
  "msg": "URL deleted successfully"
}
```

### 8. Get Top URLs

**GET** `/urls/top?limit=10`

Gets the most clicked URLs.

**Query Parameters:**
- `limit` (optional): Number of URLs to return (default: 10)

**Response:**
```json
[
  {
    "_id": "65a1b2c3d4e5f6789012345",
    "url": "https://example.com",
    "encodedUrl": "aBc123",
    "clickCount": 100,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### 9. Get Summary Statistics

**GET** `/urls/stats/summary`

Gets overall statistics.

**Response:**
```json
{
  "totalUrls": 25,
  "totalClicks": 500,
  "topUrls": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "url": "https://example.com",
      "encodedUrl": "aBc123",
      "clickCount": 100
    }
  ]
}
```

### 10. Health Check

**GET** `/urls/health`

Checks API and database health.

**Response:**
```json
{
  "status": "healthy",
  "connected": true
}
```

## Error Responses

The API returns standard HTTP status codes and error messages:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid URL format",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "URL with ID 65a1b2c3d4e5f6789012345 not found",
  "error": "Not Found"
}
```

### 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "message": [
    "url must be a valid URL"
  ],
  "error": "Unprocessable Entity"
}
```

## Data Models

### URL Document
```typescript
{
  _id: string;           // MongoDB ObjectId
  url: string;           // Original URL
  encodedUrl: string;    // Shortened URL code
  createdAt: Date;       // Creation timestamp
  updatedAt: Date;       // Last update timestamp
  clickCount: number;    // Number of clicks
}
```

## Usage Examples

### cURL Examples

**Create a shortened URL:**
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

**Get all URLs:**
```bash
curl http://localhost:3000/api/urls
```

**Redirect (browser):**
```
http://localhost:3000/api/urls/redirect/aBc123
```

### JavaScript/Fetch Examples

**Create shortened URL:**
```javascript
const response = await fetch('http://localhost:3000/api/urls', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
});

const data = await response.json();
console.log(data.shortUrl);
```

**Get statistics:**
```javascript
const response = await fetch('http://localhost:3000/api/urls/stats/summary');
const stats = await response.json();
console.log(`Total URLs: ${stats.totalUrls}, Total Clicks: ${stats.totalClicks}`);
```

## Database Schema

The application uses MongoDB with a single collection `urls`:

```javascript
{
  _id: ObjectId,
  url: String,           // Original URL (indexed)
  encodedUrl: String,    // Short code (indexed, unique)
  createdAt: Date,
  updatedAt: Date,
  clickCount: Number
}
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_MONGO` | MongoDB protocol | `mongodb` |
| `DB_HOST_MONGO` | MongoDB host | `localhost` |
| `DB_PORT_MONGO` | MongoDB port | `27017` |
| `DB_NAME_MONGO` | Database name | `url_shortener` |
| `DB_USER_MONGO` | Database username | _(empty)_ |
| `DB_PASS_MONGO` | Database password | _(empty)_ |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |

## Architecture

```
src/
├── controllers/        # Request handlers
├── services/          # Business logic
├── dto/              # Data Transfer Objects
├── db/               # Database strategies
├── config/           # Configuration
├── utils/            # Utility functions
└── modules/          # NestJS modules
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.