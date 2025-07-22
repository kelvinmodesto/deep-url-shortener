import { Router, Request, Response } from 'express';
import urlRoutes from './urlRoutes';
import redirectRoutes from './redirectRoutes';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get(
  '/health',
  asyncHandler(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: {
        service: 'URL Shortener API',
        status: 'healthy',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date(),
        uptime: process.uptime(),
      },
      message: 'Service is healthy',
      timestamp: new Date(),
    };

    res.json(response);
  })
);

// API info endpoint
router.get(
  '/info',
  asyncHandler(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: {
        name: 'URL Shortener API',
        description: 'A simple and efficient URL shortening service',
        version: '1.0.0',
        author: 'Your Name',
        endpoints: {
          'POST /api/urls': 'Create a new short URL',
          'GET /api/urls': 'Get user URLs',
          'GET /api/urls/all': 'Get all URLs (admin)',
          'GET /api/urls/top': 'Get top URLs by clicks',
          'GET /api/urls/stats/:shortCode': 'Get URL statistics',
          'GET /api/urls/:id': 'Get URL by ID',
          'PUT /api/urls/:id': 'Update URL',
          'DELETE /api/urls/:id': 'Delete URL',
          'GET /:shortCode': 'Redirect to original URL',
        },
      },
      message: 'API information retrieved successfully',
      timestamp: new Date(),
    };

    res.json(response);
  })
);

// Mount routes
router.use('/api/urls', urlRoutes);
router.use('/', redirectRoutes);

export default router;
