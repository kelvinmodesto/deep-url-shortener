import { Module } from '@nestjs/common';
import { UrlController } from '@controllers/url.controller';
import { UrlService } from 'services/url.service';

@Module({
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
