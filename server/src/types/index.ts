import { ObjectId } from 'mongodb';

export interface Url {
  _id?: ObjectId;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  userId?: string;
  isActive: boolean;
  tags?: string[];
  description?: string;
  clickHistory?: ClickEvent[];
}

export interface CreateUrlRequest {
  originalUrl: string;
  customCode?: string;
  expiresAt?: string;
  description?: string;
  tags?: string[];
}

export interface CreateUrlResponse {
  success: boolean;
  data: {
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    createdAt: Date;
    expiresAt?: Date;
  };
  message: string;
}

export interface UrlStats {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  lastClickAt?: Date;
  clickHistory: ClickEvent[];
}

export interface ClickEvent {
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  referer?: string;
  country?: string;
  city?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp: Date;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetUrlsQuery extends PaginationQuery {
  search?: string;
  tags?: string[];
  isActive?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export interface DatabaseConfig {
  uri: string;
  dbName: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
  };
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  baseUrl: string;
  shortUrlLength: number;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: ValidationError[];
}

// Extend Express Request interface for user authentication
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}
