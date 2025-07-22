import { Request, Response } from 'express';
import urlService from '../services/urlService';
import { CreateUrlRequest, ApiResponse, GetUrlsQuery } from '../types';
import {
  asyncHandler,
  NotFoundError,
  BadRequestError,
} from '../middleware/errorHandler';

export class UrlController {
  // Create a new short URL
  createShortUrl = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateUrlRequest = req.body;
    const userId = req.user?.id; // Assuming user info is added by auth middleware

    const url = await urlService.createShortUrl(data, userId);

    const response: ApiResponse = {
      success: true,
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
      },
      message: 'Short URL created successfully',
      timestamp: new Date(),
    };

    res.status(201).json(response);
  });

  // Redirect to original URL
  redirectToOriginalUrl = asyncHandler(async (req: Request, res: Response) => {
    const { shortCode } = req.params;

    const url = await urlService.getUrlByShortCode(shortCode);
    if (!url) {
      throw new NotFoundError('Short URL not found or has expired');
    }

    // Extract click data from request
    const clickData = {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      referer: req.get('Referer'),
    };

    // Increment click count asynchronously
    urlService.incrementClickCount(shortCode, clickData).catch(error => {
      console.error('Failed to increment click count:', error);
    });

    res.redirect(301, url.originalUrl);
  });

  // Get URL details by short code
  getUrlDetails = asyncHandler(async (req: Request, res: Response) => {
    const { shortCode } = req.params;

    const url = await urlService.getUrlByShortCode(shortCode);
    if (!url) {
      throw new NotFoundError('Short URL not found');
    }

    const response: ApiResponse = {
      success: true,
      data: url,
      message: 'URL details retrieved successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Get URL by ID
  getUrlById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const url = await urlService.getUrlById(id);
    if (!url) {
      throw new NotFoundError('URL not found');
    }

    const response: ApiResponse = {
      success: true,
      data: url,
      message: 'URL retrieved successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Get user's URLs
  getUserUrls = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const query: GetUrlsQuery = req.query as any;
    const { urls, total } = await urlService.getUserUrls(userId, query);

    const { page = 1, limit = 10 } = query;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: {
        urls,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: 'URLs retrieved successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Get all URLs (admin endpoint)
  getAllUrls = asyncHandler(async (req: Request, res: Response) => {
    const query: GetUrlsQuery = req.query as any;
    const { urls, total } = await urlService.getAllUrls(query);

    const { page = 1, limit = 10 } = query;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: {
        urls,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: 'URLs retrieved successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Update URL
  updateUrl = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUrl = await urlService.updateUrl(id, updateData);
    if (!updatedUrl) {
      throw new NotFoundError('URL not found');
    }

    const response: ApiResponse = {
      success: true,
      data: updatedUrl,
      message: 'URL updated successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Delete URL
  deleteUrl = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await urlService.deleteUrl(id);
    if (!deleted) {
      throw new NotFoundError('URL not found');
    }

    const response: ApiResponse = {
      success: true,
      message: 'URL deleted successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Deactivate URL
  deactivateUrl = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deactivated = await urlService.deactivateUrl(id);
    if (!deactivated) {
      throw new NotFoundError('URL not found');
    }

    const response: ApiResponse = {
      success: true,
      message: 'URL deactivated successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Get URL statistics
  getUrlStats = asyncHandler(async (req: Request, res: Response) => {
    const { shortCode } = req.params;

    const stats = await urlService.getUrlStats(shortCode);
    if (!stats) {
      throw new NotFoundError('URL not found');
    }

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'URL statistics retrieved successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Get top URLs
  getTopUrls = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const topUrls = await urlService.getTopUrls(limit);

    const response: ApiResponse = {
      success: true,
      data: topUrls,
      message: 'Top URLs retrieved successfully',
      timestamp: new Date(),
    };

    res.json(response);
  });

  // Health check for URL service
  healthCheck = asyncHandler(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: {
        service: 'URL Shortener API',
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date(),
      },
      message: 'Service is healthy',
      timestamp: new Date(),
    };

    res.json(response);
  });
}

export default new UrlController();
