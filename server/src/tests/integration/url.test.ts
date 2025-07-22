import request from 'supertest';
import app from '../../app';
import { CreateUrlRequest } from '../../types';

describe('URL API Integration Tests', () => {
  const baseUrl = '/api/urls';

  describe('POST /api/urls', () => {
    it('should create a new short URL', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        description: 'Test URL',
        tags: ['test', 'integration']
      };

      const response = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Short URL created successfully',
        data: {
          originalUrl: 'https://example.com',
          shortUrl: expect.stringMatching(/^http:\/\/localhost:3000\/.+/),
          shortCode: expect.any(String),
          createdAt: expect.any(String)
        }
      });

      expect(response.body.data.shortCode).toHaveLength(6);
    });

    it('should create a short URL with custom code', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://github.com',
        customCode: 'github123'
      };

      const response = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      expect(response.body.data.shortCode).toBe('github123');
      expect(response.body.data.shortUrl).toBe('http://localhost:3000/github123');
    });

    it('should reject invalid URL', async () => {
      const createUrlRequest = {
        originalUrl: 'not-a-valid-url',
      };

      const response = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Validation failed',
        error: 'Invalid request data'
      });
    });

    it('should reject duplicate custom code', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'duplicate123'
      };

      // Create first URL
      await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      // Try to create second URL with same custom code
      const response = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should create URL with expiration date', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        expiresAt: futureDate.toISOString()
      };

      const response = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      expect(response.body.data.expiresAt).toBeDefined();
    });
  });

  describe('GET /:shortCode (redirect)', () => {
    it('should redirect to original URL', async () => {
      // First create a URL
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'redirect123'
      };

      await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      // Test redirect
      const response = await request(app)
        .get('/redirect123')
        .expect(301);

      expect(response.header.location).toBe('https://example.com');
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'NOT_FOUND'
      });
    });
  });

  describe('GET /api/urls/details/:shortCode', () => {
    it('should get URL details by short code', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'details123',
        description: 'Test description',
        tags: ['test']
      };

      await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      const response = await request(app)
        .get(`${baseUrl}/details/details123`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          originalUrl: 'https://example.com',
          shortCode: 'details123',
          description: 'Test description',
          tags: ['test'],
          clicks: 0,
          isActive: true
        }
      });
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get(`${baseUrl}/details/nonexistent`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'NOT_FOUND'
      });
    });
  });

  describe('GET /api/urls/stats/:shortCode', () => {
    it('should get URL statistics', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'stats123'
      };

      await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      // Make a few clicks
      await request(app).get('/stats123').expect(301);
      await request(app).get('/stats123').expect(301);

      const response = await request(app)
        .get(`${baseUrl}/stats/stats123`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          shortCode: 'stats123',
          originalUrl: 'https://example.com',
          totalClicks: 2,
          clicksByDay: expect.any(Array),
          recentClicks: expect.any(Array)
        }
      });
    });
  });

  describe('GET /api/urls/top', () => {
    it('should get top URLs by clicks', async () => {
      // Create multiple URLs
      const urls = [
        { originalUrl: 'https://example1.com', customCode: 'top1' },
        { originalUrl: 'https://example2.com', customCode: 'top2' },
        { originalUrl: 'https://example3.com', customCode: 'top3' }
      ];

      for (const url of urls) {
        await request(app).post(baseUrl).send(url).expect(201);
      }

      // Make different numbers of clicks
      await request(app).get('/top1').expect(301);
      await request(app).get('/top1').expect(301);
      await request(app).get('/top1').expect(301);

      await request(app).get('/top2').expect(301);
      await request(app).get('/top2').expect(301);

      await request(app).get('/top3').expect(301);

      const response = await request(app)
        .get(`${baseUrl}/top?limit=3`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);

      // Should be sorted by clicks descending
      const topUrls = response.body.data;
      expect(topUrls[0].shortCode).toBe('top1');
      expect(topUrls[0].clicks).toBe(3);
      expect(topUrls[1].shortCode).toBe('top2');
      expect(topUrls[1].clicks).toBe(2);
      expect(topUrls[2].shortCode).toBe('top3');
      expect(topUrls[2].clicks).toBe(1);
    });
  });

  describe('PUT /api/urls/:id', () => {
    it('should update URL description and tags', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        description: 'Original description'
      };

      const createResponse = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      const urlId = createResponse.body.data.id;

      const updateData = {
        description: 'Updated description',
        tags: ['updated', 'test']
      };

      const response = await request(app)
        .put(`${baseUrl}/${urlId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          description: 'Updated description',
          tags: ['updated', 'test']
        }
      });
    });

    it('should return 404 for non-existent URL ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { description: 'Test' };

      const response = await request(app)
        .put(`${baseUrl}/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'NOT_FOUND'
      });
    });
  });

  describe('PATCH /api/urls/:id/deactivate', () => {
    it('should deactivate URL', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'deactivate123'
      };

      const createResponse = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      const urlId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`${baseUrl}/${urlId}/deactivate`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'URL deactivated successfully'
      });

      // Try to access the deactivated URL
      await request(app)
        .get('/deactivate123')
        .expect(404);
    });
  });

  describe('DELETE /api/urls/:id', () => {
    it('should delete URL', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com'
      };

      const createResponse = await request(app)
        .post(baseUrl)
        .send(createUrlRequest)
        .expect(201);

      const urlId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`${baseUrl}/${urlId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'URL deleted successfully'
      });

      // Try to get the deleted URL
      await request(app)
        .get(`${baseUrl}/${urlId}`)
        .expect(404);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          service: 'URL Shortener API',
          status: 'healthy',
          version: '1.0.0',
          environment: 'test'
        }
      });
    });
  });

  describe('GET /ping', () => {
    it('should return pong', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          message: 'pong'
        },
        message: 'Server is running'
      });
    });
  });

  describe('GET /info', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/info')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: 'URL Shortener API',
          description: 'A simple and efficient URL shortening service',
          version: '1.0.0',
          endpoints: expect.any(Object)
        }
      });
    });
  });
});
