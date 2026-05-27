const crypto = require('crypto');

/**
 * Generate password reset token
 */
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  return resetToken;
};

/**
 * Hash reset token for database storage
 */
const hashResetToken = (resetToken) => {
  return crypto.createHash('sha256').update(resetToken).digest('hex');
};

/**
 * Send password reset email (console log for demo)
 * In production, integrate with email service like SendGrid, Nodemailer, etc.
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:30003'}/reset-password/${resetToken}`;
  
  console.log(`
    ====================
    PASSWORD RESET EMAIL
    ====================
    To: ${user.email}
    Subject: Password Reset Request
    
    Hello ${user.name},
    
    You requested a password reset. Click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 10 minutes.
    
    If you didn't request this, please ignore this email.
    ====================
  `);
  
  // In production, use actual email service:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // 
  // const msg = {
  //   to: user.email,
  //   from: process.env.FROM_EMAIL,
  //   subject: 'Password Reset Request',
  //   html: `
  //     <h2>Hello ${user.name},</h2>
  //     <p>You requested a password reset. Click the link below to reset your password:</p>
  //     <a href="${resetUrl}">${resetUrl}</a>
  //     <p>This link will expire in 10 minutes.</p>
  //     <p>If you didn't request this, please ignore this email.</p>
  //   `
  // };
  // 
  // await sgMail.send(msg);
};

module.exports = {
  generateResetToken,
  hashResetToken,
  sendPasswordResetEmail
};
