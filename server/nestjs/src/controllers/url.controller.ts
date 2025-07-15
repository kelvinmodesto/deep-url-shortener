import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from '../services/url.service';
import { CreateUrlDto } from '../dto/create-url.dto';
import { UpdateUrlDto } from '../dto/update-url.dto';
import {
  UrlResponseDto,
  CreateUrlResponseDto,
  MessageResponseDto,
  UrlStatsDto,
} from '../dto/url-response.dto';

@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<CreateUrlResponseDto> {
    const result = await this.urlService.create(createUrlDto);
    return {
      msg: 'URL shortened successfully',
      addressId: result.id,
      encodedUrl: result.encodedUrl,
      shortUrl: result.shortUrl,
    };
  }

  @Get()
  async findAll(): Promise<UrlResponseDto[]> {
    return this.urlService.findAll();
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; connected: boolean }> {
    const connected = await this.urlService.validateConnection();
    return {
      status: connected ? 'healthy' : 'unhealthy',
      connected,
    };
  }

  @Get('stats/summary')
  async getSummaryStats(): Promise<{
    totalUrls: number;
    totalClicks: number;
    topUrls: UrlResponseDto[];
  }> {
    const [urls, totalClicks, topUrls] = await Promise.all([
      this.urlService.findAll(),
      this.urlService.getTotalClicks(),
      this.urlService.getTopUrls(5),
    ]);

    return {
      totalUrls: urls.length,
      totalClicks,
      topUrls,
    };
  }

  @Get('top')
  async getTopUrls(@Query('limit') limit?: string): Promise<UrlResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.urlService.getTopUrls(limitNum);
  }

  @Get('redirect/:encodedUrl')
  async redirect(
    @Param('encodedUrl') encodedUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.urlService.findByEncodedUrl(encodedUrl);
    res.redirect(301, url.url);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UrlResponseDto> {
    return this.urlService.findOne(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string): Promise<UrlStatsDto> {
    return this.urlService.getStats(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
  ): Promise<MessageResponseDto> {
    await this.urlService.update(id, updateUrlDto);
    return { msg: 'URL updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.urlService.remove(id);
    return { msg: 'URL deleted successfully' };
  }
}
