// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8;
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  return errors;
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Required field validation
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Number validation
export const isValidNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const isPositiveNumber = (value) => {
  return isValidNumber(value) && parseFloat(value) > 0;
};

// Form validation
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProgramForm = (formData) => {
  const errors = {};

  if (!formData.title || !formData.title.trim()) {
    errors.title = 'Title is required';
  }

  if (!formData.description || !formData.description.trim()) {
    errors.description = 'Description is required';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.price || !isValidNumber(formData.price)) {
    errors.price = 'Valid price is required';
  } else if (parseFloat(formData.price) < 0) {
    errors.price = 'Price cannot be negative';
  }

  if (!formData.duration || !isPositiveNumber(formData.duration)) {
    errors.duration = 'Valid duration is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUserForm = (formData) => {
  const errors = {};

  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!formData.username || !formData.username.trim()) {
    errors.username = 'Username is required';
  }

  if (!formData.role) {
    errors.role = 'Role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Length validation
export const minLength = (value, min) => {
  return value && value.length >= min;
};

export const maxLength = (value, max) => {
  return value && value.length <= max;
};

// Range validation
export const inRange = (value, min, max) => {
  const num = parseFloat(value);
  return isValidNumber(num) && num >= min && num <= max;
};
