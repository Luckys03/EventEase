const User = require('./User');
const Venue = require('./Venue');
const Booking = require('./Booking');
const Notification = require('./Notification');

// User ↔ Booking Relationship
// A User can have many Bookings
User.hasMany(Booking, {
  foreignKey: 'userId',
  as: 'bookings',
  onDelete: 'CASCADE'  // If a user is deleted, their bookings are also deleted
});

// A Booking belongs to one User (the person who made the booking)
Booking.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Venue ↔ Booking Relationship
// A Venue can have many Bookings
Venue.hasMany(Booking, {
  foreignKey: 'venueId',
  as: 'bookings',
  onDelete: 'CASCADE'  // If a venue is deleted, its bookings are also deleted
});

// A Booking belongs to one Venue
Booking.belongsTo(Venue, {
  foreignKey: 'venueId',
  as: 'venue'
});

// User ↔ Venue Relationship
// A User (vendor) can have many Venues
User.hasMany(Venue, {
  foreignKey: 'vendorId',
  as: 'venues',
  onDelete: 'CASCADE'  // If a vendor is deleted, their venues are also deleted
});

// A Venue belongs to one User (the vendor)
Venue.belongsTo(User, {
  foreignKey: 'vendorId',
  as: 'vendor'
});

// User ↔ Notification Relationship
// A User can have many Notifications
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE'  // If a user is deleted, their notifications are also deleted
});

// A Notification belongs to one User
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Booking ↔ Notification Relationship
// A Booking can have many Notifications
Booking.hasMany(Notification, {
  foreignKey: 'bookingId',
  as: 'notifications',
  onDelete: 'CASCADE'  // If a booking is deleted, its notifications are also deleted
});

// A Notification can belong to one Booking (optional)
Notification.belongsTo(Booking, {
  foreignKey: 'bookingId',
  as: 'booking'
});

module.exports = {
  User,
  Venue,
  Booking,
  Notification
};
