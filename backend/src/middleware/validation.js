const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Returns 400 with detailed error messages if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('displayName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  handleValidationErrors
];

/**
 * Validation rules for user login
 * Accepts either email OR username
 */
const validateUserLogin = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  // Custom validation to ensure at least one of email or username is provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.username) {
      throw new Error('Either email or username is required');
    }
    return true;
  }),
  handleValidationErrors
];

/**
 * Validation rules for creating a post
 */
const validateCreatePost = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 5000 })
    .withMessage('Content must not exceed 5000 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Visibility must be one of: public, followers, private'),
  body('mediaType')
    .optional()
    .isIn(['image', 'video', 'none'])
    .withMessage('Media type must be one of: image, video, none'),
  body('mediaUrl')
    .optional()
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  handleValidationErrors
];

/**
 * Validation rules for creating a comment
 */
const validateCreateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  handleValidationErrors
];

/**
 * Validation rules for creating a program
 */
const validateCreateProgram = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['insurance', 'real-estate', 'personal-development', 'all-levels'])
    .withMessage('Invalid category'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  handleValidationErrors
];

/**
 * Validation rules for updating user profile
 */
const validateUpdateProfile = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('movementGoals')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Movement goals must not exceed 1000 characters'),
  handleValidationErrors
];

/**
 * Validation rules for UUID parameters
 */
const validateUuidParam = (paramName = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  handleValidationErrors
];

/**
 * Validation rules for pagination query parameters
 */
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  handleValidationErrors
];

/**
 * Validation rules for sending a message
 */
const validateSendMessage = [
  body('receiverId')
    .isUUID()
    .withMessage('Receiver ID must be a valid UUID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message must not exceed 2000 characters'),
  handleValidationErrors
];

/**
 * Sanitize and validate email
 */
const validateEmail = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCreatePost,
  validateCreateComment,
  validateCreateProgram,
  validateUpdateProfile,
  validateUuidParam,
  validatePagination,
  validateSendMessage,
  validateEmail
};
