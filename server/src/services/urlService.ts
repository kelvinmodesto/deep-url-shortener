import { nanoid } from 'nanoid';
import { Collection, ObjectId } from 'mongodb';
import databaseConnection from '../database/connection';
import { Url, CreateUrlRequest, GetUrlsQuery, ClickEvent } from '../types';
import { serverConfig } from '../config';

export class UrlService {
  private urlsCollection: Collection<Url>;

  constructor() {
    // Initialize collection lazily to avoid database connection issues during import
    this.urlsCollection = null as any;
  }

  private getCollection(): Collection<Url> {
    if (!this.urlsCollection) {
      this.urlsCollection = databaseConnection.getDb().collection<Url>('urls');
    }
    return this.urlsCollection;
  }

  async createShortUrl(data: CreateUrlRequest, userId?: string): Promise<Url> {
    const { originalUrl, customCode, expiresAt, description, tags } = data;

    // Generate short code
    let shortCode = customCode;
    if (!shortCode) {
      shortCode = await this.generateUniqueShortCode();
    } else {
      // Check if custom code already exists
      const existingUrl = await this.urlsCollection.findOne({ shortCode });
      if (existingUrl) {
        throw new Error('Custom short code already exists');
      }
    }

    const shortUrl = `${serverConfig.baseUrl}/${shortCode}`;
    const now = new Date();

    const urlDocument: Url = {
      originalUrl,
      shortCode,
      shortUrl,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      ...(userId && { userId }),
      ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      ...(description && { description }),
      ...(tags && { tags }),
    };

    const result = await this.getCollection().insertOne(urlDocument);
    return { ...urlDocument, _id: result.insertedId };
  }

  async getUrlByShortCode(shortCode: string): Promise<Url | null> {
    return await this.getCollection().findOne({
      shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $type: 'null' } },
        { expiresAt: { $gt: new Date() } },
      ],
    } as any);
  }

  async getUrlById(id: string | ObjectId): Promise<Url | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.getCollection().findOne({
      _id: objectId,
    } as any);
  }

  async incrementClickCount(
    shortCode: string,
    clickData?: Partial<ClickEvent>
  ): Promise<void> {
    const updateData: any = {
      $inc: { clicks: 1 },
      $set: { updatedAt: new Date() },
    };

    if (clickData) {
      updateData.$push = {
        clickHistory: {
          timestamp: new Date(),
          ...clickData,
        },
      };
    }

    await this.getCollection().updateOne({ shortCode }, updateData);
  }

  async getUserUrls(
    userId: string,
    query: GetUrlsQuery
  ): Promise<{ urls: Url[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      tags,
      isActive,
      createdFrom,
      createdTo,
    } = query;

    const filter: any = { userId };

    if (search) {
      filter.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (typeof isActive === 'boolean') {
      filter.isActive = isActive;
    }

    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) {
        filter.createdAt.$gte = new Date(createdFrom);
      }
      if (createdTo) {
        filter.createdAt.$lte = new Date(createdTo);
      }
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [urls, total] = await Promise.all([
      this.getCollection()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.getCollection().countDocuments(filter),
    ]);

    return { urls, total };
  }

  async getAllUrls(
    query: GetUrlsQuery
  ): Promise<{ urls: Url[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      tags,
      isActive,
      createdFrom,
      createdTo,
    } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (typeof isActive === 'boolean') {
      filter.isActive = isActive;
    }

    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) {
        filter.createdAt.$gte = new Date(createdFrom);
      }
      if (createdTo) {
        filter.createdAt.$lte = new Date(createdTo);
      }
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [urls, total] = await Promise.all([
      this.getCollection()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.getCollection().countDocuments(filter),
    ]);

    return { urls, total };
  }

  async updateUrl(
    id: string | ObjectId,
    updateData: Partial<Url>
  ): Promise<Url | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId } as any,
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  async deleteUrl(id: string | ObjectId): Promise<boolean> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.getCollection().deleteOne({
      _id: objectId,
    } as any);
    return result.deletedCount > 0;
  }

  async deactivateUrl(id: string | ObjectId): Promise<boolean> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.getCollection().updateOne(
      { _id: objectId } as any,
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async getUrlStats(shortCode: string): Promise<any> {
    const url = await this.getCollection().findOne({ shortCode });
    if (!url) {
      return null;
    }

    // Get click statistics
    const clicksByDay = await this.getCollection()
      .aggregate([
        { $match: { shortCode } },
        { $unwind: '$clickHistory' },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$clickHistory.timestamp',
              },
            },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      totalClicks: url.clicks,
      createdAt: url.createdAt,
      clicksByDay,
      recentClicks: url.clickHistory?.slice(-10) || [],
    };
  }

  private async generateUniqueShortCode(): Promise<string> {
    let shortCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = nanoid(serverConfig.shortUrlLength);
      const existingUrl = await this.getCollection().findOne({ shortCode });
      isUnique = !existingUrl;
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique short code');
      }
    } while (!isUnique);

    return shortCode;
  }

  async cleanupExpiredUrls(): Promise<number> {
    const result = await this.getCollection().deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }

  async getTopUrls(limit = 10): Promise<Url[]> {
    return await this.getCollection()
      .find({ isActive: true })
      .sort({ clicks: -1 })
      .limit(limit)
      .toArray();
  }
}

export default new UrlService();
