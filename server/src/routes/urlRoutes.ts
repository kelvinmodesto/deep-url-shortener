import { Router } from 'express';
import urlController from '../controllers/urlController';
import { validate, validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createUrlSchema,
  updateUrlSchema,
  getUrlsQuerySchema,
  shortCodeSchema,
  mongoIdSchema
} from '../validators/urlValidator';

const router = Router();

// Create a new short URL
router.post(
  '/',
  validateBody(createUrlSchema),
  urlController.createShortUrl
);

// Get all URLs with pagination and filtering (admin endpoint)
router.get(
  '/all',
  validateQuery(getUrlsQuerySchema),
  urlController.getAllUrls
);

// Get user's URLs with pagination and filtering
router.get(
  '/my-urls',
  validateQuery(getUrlsQuerySchema),
  urlController.getUserUrls
);

// Get top URLs by clicks
router.get(
  '/top',
  urlController.getTopUrls
);

// Get URL statistics by short code
router.get(
  '/stats/:shortCode',
  validateParams(shortCodeSchema),
  urlController.getUrlStats
);

// Get URL details by short code
router.get(
  '/details/:shortCode',
  validateParams(shortCodeSchema),
  urlController.getUrlDetails
);

// Get URL by ID
router.get(
  '/:id',
  validateParams(mongoIdSchema),
  urlController.getUrlById
);

// Update URL by ID
router.put(
  '/:id',
  validate({
    params: mongoIdSchema,
    body: updateUrlSchema
  }),
  urlController.updateUrl
);

// Deactivate URL by ID
router.patch(
  '/:id/deactivate',
  validateParams(mongoIdSchema),
  urlController.deactivateUrl
);

// Delete URL by ID
router.delete(
  '/:id',
  validateParams(mongoIdSchema),
  urlController.deleteUrl
);

export default router;
