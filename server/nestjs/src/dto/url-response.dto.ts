export class UrlResponseDto {
  _id: string;
  url: string;
  encodedUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
  clickCount?: number;
}

export class CreateUrlResponseDto {
  msg: string;
  addressId: string;
  encodedUrl: string;
  shortUrl?: string;
}

export class MessageResponseDto {
  msg: string;
}

export class UrlStatsDto {
  url: string;
  encodedUrl: string;
  clickCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export class RedirectResponseDto {
  originalUrl: string;
  redirected: boolean;
}
