const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

// Initialize SendGrid client
const initializeSendGrid = () => {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('SENDGRID_API_KEY not configured. Email service will be disabled.');
    return false;
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    logger.info('SendGrid email service initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize SendGrid:', error);
    return false;
  }
};

// Initialize on module load
const isInitialized = initializeSendGrid();

// Generic send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!isInitialized) {
      logger.warn('SendGrid not initialized. Skipping email.');
      return null;
    }

    const fromEmail = process.env.FROM_EMAIL || 'noreply@intentionalmovement.com';
    const fromName = process.env.FROM_NAME || 'Intentional Movement Corp';

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject,
      html,
      text: text || undefined
    };

    const result = await sgMail.send(msg);
    logger.info(`Email sent successfully to ${to}`, { statusCode: result[0].statusCode });
    return result;
  } catch (error) {
    logger.error('Error sending email:', error);
    if (error.response) {
      logger.error('SendGrid error details:', error.response.body);
    }
    throw error;
  }
};

// Welcome email template
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Intentional Movement Corp! 🌟';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fdf2f8;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #ec4899, #db2777);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ec4899;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Intentional Movement Corp!</h1>
            <p>Planted Mind, Moving Body</p>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName || user.username},</h2>
            <p>We're thrilled to have you join our community! 🎉</p>
            <p>Intentional Movement Corp is your space to:</p>
            <ul>
              <li>Connect with a supportive wellness community</li>
              <li>Access premium fitness and wellness programs</li>
              <li>Track your personal growth journey</li>
              <li>Achieve your goals with intentional living</li>
            </ul>
            <p>Ready to get started?</p>
            <a href="${process.env.API_URL || 'http://localhost:3001'}" class="button">Explore Programs</a>
            <p>If you have any questions, we're here to help!</p>
            <p>Let's elevate your lifestyle together.</p>
            <p><strong>The Intentional Movement Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Intentional Movement Corp. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to Intentional Movement Corp!

    Hi ${user.firstName || user.username},

    We're thrilled to have you join our community!

    Intentional Movement Corp is your space to connect, grow, and achieve your wellness goals.

    Ready to get started? Visit ${process.env.API_URL || 'http://localhost:3001'} to explore programs.

    Let's elevate your lifestyle together.

    The Intentional Movement Team
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

// Password reset email template
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.API_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

  const subject = 'Reset Your Password - Intentional Movement Corp';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fdf2f8;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ec4899;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef3c7;
            padding: 15px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName || user.username},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p><strong>The Intentional Movement Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Intentional Movement Corp. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Password Reset Request

    Hi ${user.firstName || user.username},

    We received a request to reset your password. Click the link below to create a new password:

    ${resetUrl}

    This link will expire in 1 hour for security reasons.

    If you didn't request a password reset, please ignore this email.

    The Intentional Movement Team
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

// Purchase confirmation email
const sendPurchaseConfirmationEmail = async (user, program, purchase) => {
  const subject = `Purchase Confirmed: ${program.title} 🎉`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fdf2f8;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #ec4899, #db2777);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 30px;
          }
          .program-details {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ec4899;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Purchase Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName || user.username},</h2>
            <p>Thank you for your purchase! You now have full access to:</p>
            <div class="program-details">
              <h3>${program.title}</h3>
              <p>${program.description}</p>
              <p><strong>Amount Paid:</strong> $${(purchase.amount / 100).toFixed(2)}</p>
              <p><strong>Purchase Date:</strong> ${new Date(purchase.createdAt).toLocaleDateString()}</p>
            </div>
            <a href="${process.env.API_URL || 'http://localhost:3001'}/programs/${program.id}" class="button">Start Your Program</a>
            <p>We're excited to support you on your journey!</p>
            <p><strong>The Intentional Movement Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Intentional Movement Corp. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Purchase Confirmed!

    Hi ${user.firstName || user.username},

    Thank you for your purchase! You now have full access to:

    ${program.title}
    ${program.description}

    Amount Paid: $${(purchase.amount / 100).toFixed(2)}
    Purchase Date: ${new Date(purchase.createdAt).toLocaleDateString()}

    Start your program at: ${process.env.API_URL || 'http://localhost:3001'}/programs/${program.id}

    We're excited to support you on your journey!

    The Intentional Movement Team
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPurchaseConfirmationEmail,
  initializeSendGrid
};
