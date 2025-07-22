// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the url-shortener database
db = db.getSiblingDB('url-shortener');

// Create a user for the application
db.createUser({
  user: 'urlshortener',
  pwd: 'urlshortener123',
  roles: [
    {
      role: 'readWrite',
      db: 'url-shortener'
    }
  ]
});

// Create the urls collection with validation schema
db.createCollection('urls', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['originalUrl', 'shortCode', 'shortUrl', 'clicks', 'createdAt', 'updatedAt', 'isActive'],
      properties: {
        originalUrl: {
          bsonType: 'string',
          description: 'Original URL must be a string and is required'
        },
        shortCode: {
          bsonType: 'string',
          description: 'Short code must be a string and is required'
        },
        shortUrl: {
          bsonType: 'string',
          description: 'Short URL must be a string and is required'
        },
        clicks: {
          bsonType: 'int',
          minimum: 0,
          description: 'Clicks must be a non-negative integer and is required'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date must be a date and is required'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Updated date must be a date and is required'
        },
        isActive: {
          bsonType: 'bool',
          description: 'Active status must be a boolean and is required'
        },
        expiresAt: {
          bsonType: ['date', 'null'],
          description: 'Expiration date must be a date or null'
        },
        userId: {
          bsonType: ['string', 'null'],
          description: 'User ID must be a string or null'
        },
        description: {
          bsonType: ['string', 'null'],
          description: 'Description must be a string or null'
        },
        tags: {
          bsonType: ['array', 'null'],
          description: 'Tags must be an array or null',
          items: {
            bsonType: 'string'
          }
        },
        clickHistory: {
          bsonType: ['array', 'null'],
          description: 'Click history must be an array or null',
          items: {
            bsonType: 'object',
            properties: {
              timestamp: {
                bsonType: 'date',
                description: 'Click timestamp must be a date'
              },
              userAgent: {
                bsonType: ['string', 'null'],
                description: 'User agent must be a string or null'
              },
              ip: {
                bsonType: ['string', 'null'],
                description: 'IP address must be a string or null'
              },
              referer: {
                bsonType: ['string', 'null'],
                description: 'Referer must be a string or null'
              },
              country: {
                bsonType: ['string', 'null'],
                description: 'Country must be a string or null'
              },
              city: {
                bsonType: ['string', 'null'],
                description: 'City must be a string or null'
              }
            }
          }
        }
      }
    }
  }
});

// Create indexes for better performance
db.urls.createIndex({ shortCode: 1 }, { unique: true });
db.urls.createIndex({ originalUrl: 1 });
db.urls.createIndex({ createdAt: 1 });
db.urls.createIndex({ userId: 1 });
db.urls.createIndex({ isActive: 1 });
db.urls.createIndex({ tags: 1 });
db.urls.createIndex({ clicks: -1 }); // For top URLs queries
db.urls.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic expiration

// Create compound indexes for common query patterns
db.urls.createIndex({ userId: 1, createdAt: -1 }); // User URLs sorted by creation date
db.urls.createIndex({ isActive: 1, clicks: -1 }); // Active URLs sorted by clicks
db.urls.createIndex({ userId: 1, isActive: 1 }); // User's active URLs
db.urls.createIndex({ tags: 1, createdAt: -1 }); // URLs by tags sorted by creation date

// Insert some sample data for development
db.urls.insertMany([
  {
    originalUrl: 'https://github.com',
    shortCode: 'github',
    shortUrl: 'http://localhost:3000/github',
    clicks: 15,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    isActive: true,
    description: 'GitHub - The world\'s leading software development platform',
    tags: ['development', 'code', 'git'],
    clickHistory: [
      {
        timestamp: new Date('2024-01-01T10:00:00Z'),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ip: '192.168.1.100',
        referer: 'https://google.com'
      }
    ]
  },
  {
    originalUrl: 'https://stackoverflow.com',
    shortCode: 'stack',
    shortUrl: 'http://localhost:3000/stack',
    clicks: 32,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    isActive: true,
    description: 'Stack Overflow - Where developers learn and share knowledge',
    tags: ['development', 'qa', 'programming'],
    clickHistory: []
  },
  {
    originalUrl: 'https://docs.mongodb.com',
    shortCode: 'mongodocs',
    shortUrl: 'http://localhost:3000/mongodocs',
    clicks: 8,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
    isActive: true,
    description: 'MongoDB Documentation',
    tags: ['database', 'mongodb', 'docs'],
    clickHistory: []
  },
  {
    originalUrl: 'https://example.com/expired',
    shortCode: 'expired',
    shortUrl: 'http://localhost:3000/expired',
    clicks: 2,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    expiresAt: new Date('2024-01-02T00:00:00Z'), // Already expired
    isActive: true,
    description: 'This URL has expired',
    tags: ['test', 'expired'],
    clickHistory: []
  }
]);

print('✅ MongoDB initialization completed successfully!');
print('📊 Database: url-shortener');
print('👤 Application user: urlshortener');
print('🔗 Sample URLs created: 4');
print('📈 Indexes created: 10');
print('🚀 Ready for development!');
