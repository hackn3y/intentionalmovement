import * as Yup from 'yup';

/**
 * Validation schemas for forms
 */

/**
 * Login validation schema
 */
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

/**
 * Registration validation schema
 */
export const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

/**
 * Profile edit validation schema
 */
export const profileSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Display name must be at least 2 characters')
    .required('Display name is required'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  bio: Yup.string()
    .max(500, 'Bio must not exceed 500 characters'),
  movementGoals: Yup.string()
    .max(500, 'Movement goals must not exceed 500 characters'),
  website: Yup.string()
    .url('Invalid URL'),
  location: Yup.string()
    .max(100, 'Location must not exceed 100 characters'),
});

/**
 * Post validation schema
 */
export const postSchema = Yup.object().shape({
  content: Yup.string()
    .min(1, 'Post cannot be empty')
    .max(1000, 'Post must not exceed 1000 characters')
    .required('Post content is required'),
  mediaUrl: Yup.string()
    .url('Invalid media URL'),
});

/**
 * Comment validation schema
 */
export const commentSchema = Yup.object().shape({
  text: Yup.string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must not exceed 500 characters')
    .required('Comment is required'),
});

/**
 * Message validation schema
 */
export const messageSchema = Yup.object().shape({
  text: Yup.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must not exceed 1000 characters')
    .required('Message is required'),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

/**
 * Program rating validation schema
 */
export const ratingSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .required('Rating is required'),
  review: Yup.string()
    .max(1000, 'Review must not exceed 1000 characters'),
});

/**
 * Challenge creation validation schema
 */
export const challengeSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .required('Description is required'),
  category: Yup.string()
    .required('Category is required'),
  startDate: Yup.date()
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  goal: Yup.object().shape({
    value: Yup.number()
      .min(1, 'Goal value must be at least 1')
      .required('Goal value is required'),
    unit: Yup.string()
      .required('Goal unit is required'),
  }),
});

/**
 * Validation helpers
 */
export const validators = {
  /**
   * Validate email
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid
   */
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {boolean} Is valid
   */
  isUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with strength and feedback
   */
  validatePasswordStrength: (password) => {
    const result = {
      isValid: false,
      strength: 'weak',
      feedback: [],
    };

    if (password.length < 6) {
      result.feedback.push('Password must be at least 6 characters');
      return result;
    }

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength >= 4) {
      result.strength = 'strong';
      result.isValid = true;
    } else if (strength >= 3) {
      result.strength = 'medium';
      result.isValid = true;
    } else {
      result.strength = 'weak';
    }

    if (!/[a-z]/.test(password)) {
      result.feedback.push('Add lowercase letters');
    }
    if (!/[A-Z]/.test(password)) {
      result.feedback.push('Add uppercase letters');
    }
    if (!/[0-9]/.test(password)) {
      result.feedback.push('Add numbers');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      result.feedback.push('Add special characters');
    }

    return result;
  },

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} Is valid
   */
  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sanitize text input
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  sanitizeText: (text) => {
    return text.trim().replace(/\s+/g, ' ');
  },
};
