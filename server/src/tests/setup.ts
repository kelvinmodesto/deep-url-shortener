import { MongoMemoryServer } from 'mongodb-memory-server';
// import { MongoClient } from 'mongodb';
import databaseConnection from '../database/connection';

let mongoServer: MongoMemoryServer;

// Global setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set the test database URI
  process.env.MONGODB_URI = mongoUri;
  process.env.MONGODB_DB_NAME = 'url-shortener-test';
  process.env.NODE_ENV = 'test';

  // Connect to the test database
  await databaseConnection.connect();
  await databaseConnection.createIndexes();
}, 60000);

// Global teardown after all tests
afterAll(async () => {
  // Close database connection
  await databaseConnection.disconnect();

  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);

// Clean up before each test
beforeEach(async () => {
  if (databaseConnection.isDbConnected()) {
    const db = databaseConnection.getDb();
    const collections = await db.collections();

    // Clear all collections
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

// Extend Jest matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeValidUrl(received) {
    const urlPattern = /^https?:\/\/.+/;
    const pass = typeof received === 'string' && urlPattern.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  createMockUrl: () => ({
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    shortUrl: 'http://localhost:3000/abc123',
    clicks: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  }),

  createMockCreateUrlRequest: () => ({
    originalUrl: 'https://example.com',
    description: 'Test URL',
    tags: ['test'],
  }),

  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Declare global types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidUrl(): R;
    }
  }

  var testUtils: {
    createMockUrl: () => any;
    createMockCreateUrlRequest: () => any;
    sleep: (ms: number) => Promise<void>;
  };
}

// Suppress console logs during tests unless LOG_LEVEL is set
if (!process.env.LOG_LEVEL) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}
