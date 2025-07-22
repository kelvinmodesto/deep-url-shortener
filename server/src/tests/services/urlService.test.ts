import { UrlService } from '../../services/urlService';
import { CreateUrlRequest } from '../../types';

describe('UrlService', () => {
  let urlService: UrlService;

  beforeEach(() => {
    urlService = new UrlService();
  });

  describe('createShortUrl', () => {
    it('should create a short URL with valid data', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        description: 'Test URL',
        tags: ['test'],
      };

      const result = await urlService.createShortUrl(createUrlRequest);

      expect(result).toMatchObject({
        originalUrl: 'https://example.com',
        shortCode: expect.any(String),
        shortUrl: expect.stringMatching(/^http:\/\/localhost:3000\/.+/),
        clicks: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isActive: true,
        description: 'Test URL',
        tags: ['test'],
      });

      expect(result.shortCode).toHaveLength(6);
      expect(result.shortUrl).toBeValidUrl();
      expect(result.createdAt).toBeValidDate();
    });

    it('should create a short URL with custom code', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'custom123',
      };

      const result = await urlService.createShortUrl(createUrlRequest);

      expect(result.shortCode).toBe('custom123');
      expect(result.shortUrl).toBe('http://localhost:3000/custom123');
    });

    it('should throw error for duplicate custom code', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'duplicate',
      };

      // Create first URL
      await urlService.createShortUrl(createUrlRequest);

      // Try to create second URL with same custom code
      await expect(urlService.createShortUrl(createUrlRequest)).rejects.toThrow(
        'Custom short code already exists'
      );
    });

    it('should create URL with expiration date', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        expiresAt: futureDate.toISOString(),
      };

      const result = await urlService.createShortUrl(createUrlRequest);

      expect(result.expiresAt).toEqual(futureDate);
    });
  });

  describe('getUrlByShortCode', () => {
    it('should retrieve URL by short code', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'test123',
      };

      await urlService.createShortUrl(createUrlRequest);
      const retrievedUrl = await urlService.getUrlByShortCode('test123');

      expect(retrievedUrl).toMatchObject({
        originalUrl: 'https://example.com',
        shortCode: 'test123',
        isActive: true,
      });
    });

    it('should return null for non-existent short code', async () => {
      const result = await urlService.getUrlByShortCode('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for inactive URL', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'inactive',
      };

      const createdUrl = await urlService.createShortUrl(createUrlRequest);

      // Deactivate the URL
      await urlService.updateUrl(createdUrl._id!.toString(), {
        isActive: false,
      });

      const result = await urlService.getUrlByShortCode('inactive');
      expect(result).toBeNull();
    });

    it('should return null for expired URL', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'expired',
        expiresAt: pastDate.toISOString(),
      };

      await urlService.createShortUrl(createUrlRequest);
      const result = await urlService.getUrlByShortCode('expired');

      expect(result).toBeNull();
    });
  });

  describe('incrementClickCount', () => {
    it('should increment click count', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'clicktest',
      };

      await urlService.createShortUrl(createUrlRequest);

      // Increment clicks
      await urlService.incrementClickCount('clicktest');

      const url = await urlService.getUrlByShortCode('clicktest');
      expect(url?.clicks).toBe(1);
    });

    it('should increment click count with click data', async () => {
      const createUrlRequest: CreateUrlRequest = {
        originalUrl: 'https://example.com',
        customCode: 'clickdata',
      };

      await urlService.createShortUrl(createUrlRequest);

      const clickData = {
        userAgent: 'Mozilla/5.0',
        ip: '127.0.0.1',
        referer: 'https://google.com',
      };

      await urlService.incrementClickCount('clickdata', clickData);

      const url = await urlService.getUrlByShortCode('clickdata');
      expect(url?.clicks).toBe(1);
    });
  });

  describe('getUserUrls', () => {
    it('should return user URLs with pagination', async () => {
      const userId = 'user123';

      // Create multiple URLs for the user
      for (let i = 0; i < 5; i++) {
        await urlService.createShortUrl(
          {
            originalUrl: `https://example${i}.com`,
          },
          userId
        );
      }

      const result = await urlService.getUserUrls(userId, {
        page: 1,
        limit: 3,
      });

      expect(result.urls).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.urls[0].userId).toBe(userId);
    });

    it('should filter URLs by search term', async () => {
      const userId = 'user123';

      await urlService.createShortUrl(
        {
          originalUrl: 'https://github.com',
          description: 'GitHub repository',
        },
        userId
      );

      await urlService.createShortUrl(
        {
          originalUrl: 'https://google.com',
          description: 'Search engine',
        },
        userId
      );

      const result = await urlService.getUserUrls(userId, {
        search: 'github',
      });

      expect(result.urls).toHaveLength(1);
      expect(result.urls[0].originalUrl).toBe('https://github.com');
    });

    it('should filter URLs by tags', async () => {
      const userId = 'user123';

      await urlService.createShortUrl(
        {
          originalUrl: 'https://example1.com',
          tags: ['work', 'important'],
        },
        userId
      );

      await urlService.createShortUrl(
        {
          originalUrl: 'https://example2.com',
          tags: ['personal'],
        },
        userId
      );

      const result = await urlService.getUserUrls(userId, {
        tags: ['work'],
      });

      expect(result.urls).toHaveLength(1);
      expect(result.urls[0].tags).toContain('work');
    });
  });

  describe('getTopUrls', () => {
    it('should return top URLs by click count', async () => {
      // Create URLs with different click counts
      await urlService.createShortUrl({
        originalUrl: 'https://example1.com',
        customCode: 'url1',
      });

      await urlService.createShortUrl({
        originalUrl: 'https://example2.com',
        customCode: 'url2',
      });

      // Simulate clicks
      await urlService.incrementClickCount('url1');
      await urlService.incrementClickCount('url1');
      await urlService.incrementClickCount('url2');

      const topUrls = await urlService.getTopUrls(2);

      expect(topUrls).toHaveLength(2);
      expect(topUrls[0].shortCode).toBe('url1');
      expect(topUrls[0].clicks).toBe(2);
      expect(topUrls[1].shortCode).toBe('url2');
      expect(topUrls[1].clicks).toBe(1);
    });
  });

  describe('deleteUrl', () => {
    it('should delete URL by ID', async () => {
      const url = await urlService.createShortUrl({
        originalUrl: 'https://example.com',
      });

      const deleted = await urlService.deleteUrl(url._id!.toString());
      expect(deleted).toBe(true);

      const retrievedUrl = await urlService.getUrlById(url._id!.toString());
      expect(retrievedUrl).toBeNull();
    });

    it('should return false for non-existent URL', async () => {
      const deleted = await urlService.deleteUrl('507f1f77bcf86cd799439011');
      expect(deleted).toBe(false);
    });
  });

  describe('cleanupExpiredUrls', () => {
    it('should remove expired URLs', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      await urlService.createShortUrl({
        originalUrl: 'https://example.com',
        customCode: 'expired1',
        expiresAt: pastDate.toISOString(),
      });

      await urlService.createShortUrl({
        originalUrl: 'https://example2.com',
        customCode: 'active1',
      });

      const deletedCount = await urlService.cleanupExpiredUrls();
      expect(deletedCount).toBe(1);

      const expiredUrl = await urlService.getUrlByShortCode('expired1');
      const activeUrl = await urlService.getUrlByShortCode('active1');

      expect(expiredUrl).toBeNull();
      expect(activeUrl).not.toBeNull();
    });
  });
});
