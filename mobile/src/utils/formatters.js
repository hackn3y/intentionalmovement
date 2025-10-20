import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

/**
 * Date and time formatters
 */
export const formatters = {
  /**
   * Format date to relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatRelativeTime: (date) => {
    try {
      if (!date) return '';
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return '';
    }
  },

  /**
   * Format date for messages (e.g., "Today 10:30 AM", "Yesterday 5:45 PM", "Jan 15")
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatMessageTime: (date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;

      if (isToday(dateObj)) {
        return format(dateObj, 'p'); // e.g., "10:30 AM"
      } else if (isYesterday(dateObj)) {
        return 'Yesterday';
      } else if (isThisWeek(dateObj)) {
        return format(dateObj, 'EEEE'); // e.g., "Monday"
      } else {
        return format(dateObj, 'MMM d'); // e.g., "Jan 15"
      }
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  },

  /**
   * Format full date and time
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDateTime: (date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'PPp'); // e.g., "Jan 15, 2024, 10:30 AM"
    } catch (error) {
      console.error('Error formatting date time:', error);
      return '';
    }
  },

  /**
   * Format date only
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate: (date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'PP'); // e.g., "Jan 15, 2024"
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  },

  /**
   * Format time only
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted time
   */
  formatTime: (date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'p'); // e.g., "10:30 AM"
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  },

  /**
   * Format duration in seconds to readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration (e.g., "1h 30m", "45m", "30s")
   */
  formatDuration: (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  },

  /**
   * Format number with thousands separator
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatNumber: (number) => {
    return number.toLocaleString();
  },

  /**
   * Format number to compact form (e.g., 1.2K, 3.5M)
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatCompactNumber: (number) => {
    if (number < 1000) {
      return number.toString();
    } else if (number < 1000000) {
      return `${(number / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    } else if (number < 1000000000) {
      return `${(number / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else {
      return `${(number / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
    }
  },

  /**
   * Format file size in bytes to readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize: (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} Formatted currency
   */
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * Format percentage
   * @param {number} value - Value to format (0-100)
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  formatPercentage: (value, decimals = 0) => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText: (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength)}...`;
  },

  /**
   * Capitalize first letter
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
  capitalizeFirst: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Convert to title case
   * @param {string} text - Text to convert
   * @returns {string} Title case text
   */
  toTitleCase: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Format workout stats
   * @param {Object} stats - Workout stats
   * @returns {string} Formatted stats
   */
  formatWorkoutStats: (stats) => {
    const { duration, calories, distance, reps } = stats;
    const parts = [];

    if (duration) parts.push(formatters.formatDuration(duration));
    if (calories) parts.push(`${calories} cal`);
    if (distance) parts.push(`${distance} km`);
    if (reps) parts.push(`${reps} reps`);

    return parts.join(' • ');
  },

  /**
   * Format initials from name
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @returns {string} Initials
   */
  getInitials: (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  },

  /**
   * Parse a date-only string (YYYY-MM-DD) as a local date, not UTC
   * This prevents timezone issues where "2025-10-31" shows as Oct 30 in some timezones
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {Date} Date object representing local date
   */
  parseLocalDateString: (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  },

  /**
   * Format a date-only string (YYYY-MM-DD) to a readable format
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @param {string} formatStr - Date-fns format string (default: 'PPPP')
   * @returns {string} Formatted date
   */
  formatDateString: (dateString, formatStr = 'PPPP') => {
    try {
      const date = formatters.parseLocalDateString(dateString);
      if (!date) return '';
      return format(date, formatStr);
    } catch (error) {
      console.error('Error formatting date string:', error);
      return '';
    }
  },
};
