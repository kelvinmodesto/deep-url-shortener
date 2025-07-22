import { Router } from 'express';
import urlController from '../controllers/urlController';
import { validateParams } from '../middleware/validation';
import { shortCodeSchema } from '../validators/urlValidator';

const router = Router();

// Redirect to original URL by short code
// This is the main redirect endpoint that users will hit
router.get(
  '/:shortCode',
  validateParams(shortCodeSchema),
  urlController.redirectToOriginalUrl
);

export default router;
