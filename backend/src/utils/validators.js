const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('username').isLength({ min: 3 }).trim().escape(),
    body('fullName').optional().trim().escape(),
    handleValidationErrors
  ],

  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidationErrors
  ],

  updateProfile: [
    body('username').optional().isLength({ min: 3 }).trim().escape(),
    body('fullName').optional().trim().escape(),
    body('bio').optional().trim().escape(),
    body('website').optional().isURL(),
    handleValidationErrors
  ]
};

// Post validation rules
const postValidation = {
  create: [
    body('content').notEmpty().trim().escape(),
    body('imageUrl').optional().isURL(),
    body('videoUrl').optional().isURL(),
    handleValidationErrors
  ],

  comment: [
    body('content').notEmpty().trim().escape(),
    handleValidationErrors
  ]
};

// Program validation rules
const programValidation = {
  create: [
    body('title').notEmpty().trim().escape(),
    body('description').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('category').notEmpty().trim().escape(),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
    handleValidationErrors
  ],

  update: [
    body('title').optional().trim().escape(),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().trim().escape(),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    handleValidationErrors
  ]
};

// Message validation rules
const messageValidation = {
  send: [
    body('receiverId').isInt(),
    body('content').notEmpty().trim().escape(),
    handleValidationErrors
  ]
};

// Challenge validation rules
const challengeValidation = {
  create: [
    body('title').notEmpty().trim().escape(),
    body('description').notEmpty().trim(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('goal').optional().trim(),
    handleValidationErrors
  ]
};

// ID parameter validation
const validateId = [
  param('id').isInt().withMessage('ID must be an integer'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  userValidation,
  postValidation,
  programValidation,
  messageValidation,
  challengeValidation,
  validateId,
  validatePagination
};
