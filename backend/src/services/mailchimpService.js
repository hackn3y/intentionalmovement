const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Mailchimp Marketing API Service
 * Handles newsletter subscriptions for Intentional Movement Corp
 */

class MailchimpService {
  constructor() {
    this.apiKey = process.env.MAILCHIMP_API_KEY;
    this.serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us1', 'us2', etc.
    this.listId = process.env.MAILCHIMP_LIST_ID;

    // Base URL for Mailchimp API
    if (this.apiKey && this.serverPrefix) {
      this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
    }
  }

  /**
   * Check if Mailchimp is configured
   */
  isConfigured() {
    return !!(this.apiKey && this.serverPrefix && this.listId);
  }

  /**
   * Subscribe a user to the newsletter
   * @param {Object} userData - User data
   * @param {string} userData.email - User's email address
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name (optional)
   * @returns {Promise<Object>} - Subscription result
   */
  async subscribeUser({ email, firstName, lastName = '' }) {
    if (!this.isConfigured()) {
      logger.warn('Mailchimp is not configured. Skipping newsletter subscription.');
      return { success: false, message: 'Mailchimp not configured' };
    }

    try {
      const url = `${this.baseUrl}/lists/${this.listId}/members`;

      const data = {
        email_address: email,
        status: 'subscribed', // 'subscribed', 'pending', or 'unsubscribed'
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
        tags: ['App Signup'], // Tag users who signed up via the app
      };

      const response = await axios.post(url, data, {
        auth: {
          username: 'anystring', // Can be any string for Mailchimp
          password: this.apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      logger.info('User subscribed to Mailchimp newsletter', {
        email,
        mailchimpId: response.data.id,
      });

      return {
        success: true,
        mailchimpId: response.data.id,
        message: 'Successfully subscribed to newsletter',
      };
    } catch (error) {
      // Handle specific Mailchimp errors
      if (error.response) {
        const { status, data } = error.response;

        // User already subscribed
        if (status === 400 && data.title === 'Member Exists') {
          logger.info('User already subscribed to Mailchimp', { email });
          return {
            success: true,
            message: 'User already subscribed',
            alreadySubscribed: true,
          };
        }

        // Other Mailchimp errors
        logger.error('Mailchimp subscription error', {
          email,
          status,
          error: data.detail || data.title,
        });

        return {
          success: false,
          message: data.detail || 'Failed to subscribe to newsletter',
        };
      }

      // Network or other errors
      logger.error('Mailchimp network error', {
        email,
        error: error.message,
      });

      return {
        success: false,
        message: 'Network error while subscribing to newsletter',
      };
    }
  }

  /**
   * Update subscriber information
   * @param {string} email - User's email address
   * @param {Object} updates - Fields to update
   */
  async updateSubscriber(email, updates) {
    if (!this.isConfigured()) {
      logger.warn('Mailchimp is not configured. Skipping update.');
      return { success: false, message: 'Mailchimp not configured' };
    }

    try {
      // Mailchimp uses MD5 hash of lowercase email as subscriber ID
      const crypto = require('crypto');
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const url = `${this.baseUrl}/lists/${this.listId}/members/${subscriberHash}`;

      const data = {
        merge_fields: updates,
      };

      const response = await axios.patch(url, data, {
        auth: {
          username: 'anystring',
          password: this.apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      logger.info('Mailchimp subscriber updated', { email });

      return {
        success: true,
        message: 'Subscriber information updated',
      };
    } catch (error) {
      logger.error('Failed to update Mailchimp subscriber', {
        email,
        error: error.response?.data || error.message,
      });

      return {
        success: false,
        message: 'Failed to update subscriber',
      };
    }
  }

  /**
   * Unsubscribe a user from the newsletter
   * @param {string} email - User's email address
   */
  async unsubscribeUser(email) {
    if (!this.isConfigured()) {
      logger.warn('Mailchimp is not configured. Skipping unsubscribe.');
      return { success: false, message: 'Mailchimp not configured' };
    }

    try {
      const crypto = require('crypto');
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const url = `${this.baseUrl}/lists/${this.listId}/members/${subscriberHash}`;

      const response = await axios.patch(
        url,
        { status: 'unsubscribed' },
        {
          auth: {
            username: 'anystring',
            password: this.apiKey,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('User unsubscribed from Mailchimp', { email });

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      };
    } catch (error) {
      logger.error('Failed to unsubscribe from Mailchimp', {
        email,
        error: error.response?.data || error.message,
      });

      return {
        success: false,
        message: 'Failed to unsubscribe',
      };
    }
  }

  /**
   * Add tags to a subscriber
   * @param {string} email - User's email address
   * @param {Array<string>} tags - Tags to add
   */
  async addTags(email, tags) {
    if (!this.isConfigured()) {
      return { success: false, message: 'Mailchimp not configured' };
    }

    try {
      const crypto = require('crypto');
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const url = `${this.baseUrl}/lists/${this.listId}/members/${subscriberHash}/tags`;

      const data = {
        tags: tags.map((tag) => ({ name: tag, status: 'active' })),
      };

      await axios.post(url, data, {
        auth: {
          username: 'anystring',
          password: this.apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      logger.info('Tags added to Mailchimp subscriber', { email, tags });

      return {
        success: true,
        message: 'Tags added successfully',
      };
    } catch (error) {
      logger.error('Failed to add tags to Mailchimp subscriber', {
        email,
        error: error.response?.data || error.message,
      });

      return {
        success: false,
        message: 'Failed to add tags',
      };
    }
  }
}

// Export singleton instance
module.exports = new MailchimpService();
