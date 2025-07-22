import dotenv from 'dotenv';
import { DatabaseConfig, ServerConfig } from '../types';

// Load environment variables
dotenv.config();

export const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  shortUrlLength: parseInt(process.env.SHORT_URL_LENGTH || '6', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    10
  ),
};

export const databaseConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener',
  dbName: process.env.MONGODB_DB_NAME || 'url-shortener',
  options: {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
  },
};

export const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && serverConfig.nodeEnv === 'production') {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

export default {
  server: serverConfig,
  database: databaseConfig,
  log: logConfig,
};
