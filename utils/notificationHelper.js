const Notification = require('../models/Notification');

/**
 * Create a new notification for a user
 * @param {number} userId - ID of the user to notify
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Type of notification
 * @param {number} [bookingId] - Optional booking ID if related to a booking
 * @returns {Promise<Notification>} Created notification
 */
const createNotification = async (userId, title, message, type, bookingId = null) => {
  try {
    return await Notification.create({
      userId,
      bookingId,
      title,
      message,
      type,
      isRead: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send booking confirmation notification to user
 * @param {number} userId - ID of the user who made the booking
 * @param {number} bookingId - ID of the booking
 * @param {string} venueName - Name of the booked venue
 * @param {string} startDate - Start date of the booking
 * @returns {Promise<Notification>} Created notification
 */
const sendBookingConfirmation = async (userId, bookingId, venueName, startDate) => {
  const title = 'Booking Confirmed!';
  const message = `Your booking for ${venueName} on ${new Date(startDate).toLocaleDateString()} has been confirmed.`;
  
  return createNotification(userId, title, message, 'booking_created', bookingId);
};

/**
 * Send booking update notification
 * @param {number} userId - ID of the user
 * @param {number} bookingId - ID of the booking
 * @param {string} venueName - Name of the venue
 * @param {string} status - New status of the booking
 * @returns {Promise<Notification>} Created notification
 */
const sendBookingUpdate = async (userId, bookingId, venueName, status) => {
  const title = 'Booking Updated';
  const message = `Your booking for ${venueName} has been ${status}.`;
  
  return createNotification(userId, title, message, 'booking_updated', bookingId);
};

/**
 * Send booking cancellation notification
 * @param {number} userId - ID of the user
 * @param {number} bookingId - ID of the booking
 * @param {string} venueName - Name of the venue
 * @returns {Promise<Notification>} Created notification
 */
const sendBookingCancellation = async (userId, bookingId, venueName) => {
  const title = 'Booking Cancelled';
  const message = `Your booking for ${venueName} has been cancelled successfully.`;
  
  return createNotification(userId, title, message, 'booking_cancelled', bookingId);
};

/**
 * Send payment confirmation notification
 * @param {number} userId - ID of the user
 * @param {number} bookingId - ID of the booking
 * @param {string} venueName - Name of the venue
 * @param {number} amount - Payment amount
 * @returns {Promise<Notification>} Created notification
 */
const sendPaymentConfirmation = async (userId, bookingId, venueName, amount) => {
  const title = 'Payment Received';
  const message = `Payment of ₹${amount} for ${venueName} has been received.`;
  
  return createNotification(userId, title, message, 'payment_received', bookingId);
};

module.exports = {
  createNotification,
  sendBookingConfirmation,
  sendBookingUpdate,
  sendBookingCancellation,
  sendPaymentConfirmation
};
