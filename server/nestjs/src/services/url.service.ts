import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CreateUrlDto } from '@dto/create-url.dto';
import { UpdateUrlDto } from '@dto/update-url.dto';
import { UrlResponseDto, UrlStatsDto } from '@dto/url-response.dto';
import MongoDBStrategy from '@db/mongo/mongoDBStrategy';
import createId from '../utils/createId';

@Injectable()
export class UrlService implements OnModuleInit {
  private dbStrategy: MongoDBStrategy;

  constructor() {
    this.dbStrategy = new MongoDBStrategy('urls');
  }

  async onModuleInit() {
    try {
      await this.dbStrategy.connect();
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async create(
    createUrlDto: CreateUrlDto,
  ): Promise<{ id: string; encodedUrl: string; shortUrl: string }> {
    const { url } = createUrlDto;

    if (!url) {
      throw new BadRequestException('URL is required');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    // Check if URL already exists
    const existingUrl = await this.dbStrategy.read({ url });
    if (existingUrl) {
      return {
        id: existingUrl._id.toString(),
        encodedUrl: existingUrl.encodedUrl,
        shortUrl: `http://localhost:3000/api/urls/redirect/${existingUrl.encodedUrl}`,
      };
    }

    // Generate unique encoded URL
    let encodedUrl = createId();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const existing = await this.dbStrategy.read({ encodedUrl });
      if (!existing) {
        isUnique = true;
      } else {
        encodedUrl = createId();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new BadRequestException(
        'Failed to generate unique short URL. Please try again.',
      );
    }

    const urlData = {
      url,
      encodedUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      clickCount: 0,
    };

    const id = await this.dbStrategy.create(urlData);
    return {
      id: id.toString(),
      encodedUrl,
      shortUrl: `http://localhost:3000/api/urls/redirect/${encodedUrl}`,
    };
  }

  async findAll(): Promise<UrlResponseDto[]> {
    try {
      return await this.dbStrategy.read({}, true);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      throw new BadRequestException('Failed to fetch URLs');
    }
  }

  async findOne(id: string): Promise<UrlResponseDto> {
    if (!id) {
      throw new BadRequestException('Invalid URL ID');
    }

    // Validate ObjectId format
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid URL ID format');
    }

    try {
      const url = await this.dbStrategy.read({ _id: new ObjectId(id) });

      if (!url) {
        throw new NotFoundException(`URL with ID ${id} not found`);
      }

      return url;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding URL:', error);
      throw new BadRequestException('Failed to fetch URL');
    }
  }

  async findByEncodedUrl(encodedUrl: string): Promise<UrlResponseDto> {
    if (!encodedUrl) {
      throw new BadRequestException('Invalid encoded URL');
    }

    try {
      const url = await this.dbStrategy.read({ encodedUrl });

      if (!url) {
        throw new NotFoundException('Shortened URL not found');
      }

      // Increment click count
      await this.dbStrategy.update(url._id.toString(), {
        clickCount: (url.clickCount || 0) + 1,
        updatedAt: new Date(),
      });

      return url;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding URL by encoded URL:', error);
      throw new BadRequestException('Failed to process redirect');
    }
  }

  async update(id: string, updateUrlDto: UpdateUrlDto): Promise<void> {
    if (!id) {
      throw new BadRequestException('Invalid URL ID');
    }

    // Validate ObjectId format
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid URL ID format');
    }

    // Check if URL exists
    await this.findOne(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updateUrlDto.url) {
      // Validate URL format
      try {
        new URL(updateUrlDto.url);
      } catch {
        throw new BadRequestException('Invalid URL format');
      }
      updateData.url = updateUrlDto.url;
    }

    try {
      await this.dbStrategy.update(id, updateData);
    } catch (error) {
      console.error('Error updating URL:', error);
      throw new BadRequestException('Failed to update URL');
    }
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Invalid URL ID');
    }

    // Validate ObjectId format
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid URL ID format');
    }

    // Check if URL exists
    await this.findOne(id);

    try {
      await this.dbStrategy.delete(id);
    } catch (error) {
      console.error('Error deleting URL:', error);
      throw new BadRequestException('Failed to delete URL');
    }
  }

  async getStats(id: string): Promise<UrlStatsDto> {
    const url = await this.findOne(id);
    return {
      url: url.url,
      encodedUrl: url.encodedUrl,
      clickCount: url.clickCount || 0,
      createdAt: url.createdAt || new Date(),
      updatedAt: url.updatedAt,
    };
  }

  async getTopUrls(limit: number = 10): Promise<UrlResponseDto[]> {
    try {
      // This is a simplified version. In a real implementation,
      // you'd want to use MongoDB aggregation pipeline for sorting
      const urls = await this.dbStrategy.read({}, true);
      return urls
        .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top URLs:', error);
      throw new BadRequestException('Failed to fetch top URLs');
    }
  }

  async getTotalClicks(): Promise<number> {
    try {
      const urls = await this.dbStrategy.read({}, true);
      return urls.reduce((total, url) => total + (url.clickCount || 0), 0);
    } catch (error) {
      console.error('Error calculating total clicks:', error);
      throw new BadRequestException('Failed to calculate total clicks');
    }
  }

  private isValidObjectId(id: string): boolean {
    // Basic ObjectId validation (24 character hex string)
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async validateConnection(): Promise<boolean> {
    try {
      return await this.dbStrategy.isConnected();
    } catch (error) {
      console.error('Database connection validation failed:', error);
      return false;
    }
  }
}
