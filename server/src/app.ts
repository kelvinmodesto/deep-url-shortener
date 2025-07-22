import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { serverConfig } from './config';
import databaseConnection from './database/connection';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ApiResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
const port = serverConfig.port;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin:
      serverConfig.nodeEnv === 'development'
        ? [
            'http://localhost:3001',
            'http://localhost:5173',
            'http://localhost:3000',
          ]
        : serverConfig.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

// Health check endpoint (before routes)
app.get('/ping', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: 'pong',
      timestamp: new Date(),
      uptime: process.uptime(),
    },
    message: 'Server is running',
    timestamp: new Date(),
  };
  res.json(response);
});

// Mount all routes
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  // Close database connection
  try {
    await databaseConnection.disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }

  // Exit process
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    await databaseConnection.connect();
    await databaseConnection.createIndexes();

    // Start listening
    app.listen(port, () => {
      console.log(`
🚀 URL Shortener API Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: http://localhost:${port}
🌍 Environment: ${serverConfig.nodeEnv}
💾 Database: Connected
📝 API Documentation: http://localhost:${port}/info
🔍 Health Check: http://localhost:${port}/ping
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
