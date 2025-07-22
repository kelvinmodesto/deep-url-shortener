import { Request, Response, NextFunction } from 'express';
import { ObjectSchema, ValidationError } from 'joi';
import {
  ApiResponse,
  ValidationError as CustomValidationError,
} from '../types';

export interface ValidationOptions {
  body?: ObjectSchema;
  params?: ObjectSchema;
  query?: ObjectSchema;
  headers?: ObjectSchema;
}

export const validate = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: CustomValidationError[] = [];

    // Validate request body
    if (options.body) {
      const { error } = options.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...mapJoiErrors(error, 'body'));
      }
    }

    // Validate request parameters
    if (options.params) {
      const { error } = options.params.validate(req.params, {
        abortEarly: false,
      });
      if (error) {
        errors.push(...mapJoiErrors(error, 'params'));
      }
    }

    // Validate query parameters
    if (options.query) {
      const { error, value } = options.query.validate(req.query, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      if (error) {
        errors.push(...mapJoiErrors(error, 'query'));
      } else {
        // Update req.query with validated and transformed values
        req.query = value;
      }
    }

    // Validate request headers
    if (options.headers) {
      const { error } = options.headers.validate(req.headers, {
        abortEarly: false,
      });
      if (error) {
        errors.push(...mapJoiErrors(error, 'headers'));
      }
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: 'Invalid request data',
        timestamp: new Date(),
      };

      res.status(400).json({
        ...response,
        details: errors,
      });
      return;
    }

    return next();
  };
};

const mapJoiErrors = (
  error: ValidationError,
  source: string
): CustomValidationError[] => {
  return error.details.map(detail => ({
    field: `${source}.${detail.path.join('.')}`,
    message: detail.message,
    value: detail.context?.value,
  }));
};

// Pre-configured validation middleware for common scenarios
export const validateBody = (schema: ObjectSchema) =>
  validate({ body: schema });
export const validateParams = (schema: ObjectSchema) =>
  validate({ params: schema });
export const validateQuery = (schema: ObjectSchema) =>
  validate({ query: schema });
export const validateHeaders = (schema: ObjectSchema) =>
  validate({ headers: schema });
