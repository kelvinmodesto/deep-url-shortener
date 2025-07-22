import Joi from 'joi';

// URL validation schema
export const createUrlSchema = Joi.object({
  originalUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required()
    .messages({
      'string.uri': 'Original URL must be a valid HTTP or HTTPS URL',
      'any.required': 'Original URL is required'
    }),

  customCode: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .optional()
    .messages({
      'string.alphanum': 'Custom code must contain only alphanumeric characters',
      'string.min': 'Custom code must be at least 3 characters long',
      'string.max': 'Custom code cannot exceed 20 characters'
    }),

  expiresAt: Joi.date()
    .greater('now')
    .optional()
    .messages({
      'date.greater': 'Expiration date must be in the future'
    }),

  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),

  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 50 characters'
    })
});

// Update URL schema
export const updateUrlSchema = Joi.object({
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),

  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),

  isActive: Joi.boolean()
    .optional()
});

// Query parameters validation
export const getUrlsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'clicks', 'originalUrl')
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, updatedAt, clicks, originalUrl'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    }),

  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),

  tags: Joi.array()
    .items(Joi.string().max(50))
    .optional(),

  isActive: Joi.boolean()
    .optional(),

  createdFrom: Joi.date()
    .optional(),

  createdTo: Joi.date()
    .optional()
    .when('createdFrom', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('createdFrom')),
      otherwise: Joi.date()
    })
    .messages({
      'date.greater': 'Created to date must be after created from date'
    })
});

// Short code validation
export const shortCodeSchema = Joi.object({
  shortCode: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Short code must contain only alphanumeric characters',
      'string.min': 'Short code must be at least 3 characters long',
      'string.max': 'Short code cannot exceed 20 characters',
      'any.required': 'Short code is required'
    })
});

// MongoDB ObjectId validation
export const mongoIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required'
    })
});

// Validation helper functions
export const validateCreateUrl = (data: any) => {
  return createUrlSchema.validate(data, { abortEarly: false });
};

export const validateUpdateUrl = (data: any) => {
  return updateUrlSchema.validate(data, { abortEarly: false });
};

export const validateGetUrlsQuery = (data: any) => {
  return getUrlsQuerySchema.validate(data, { abortEarly: false });
};

export const validateShortCode = (data: any) => {
  return shortCodeSchema.validate(data, { abortEarly: false });
};

export const validateMongoId = (data: any) => {
  return mongoIdSchema.validate(data, { abortEarly: false });
};
