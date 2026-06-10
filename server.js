require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Import models to ensure associations are registered
require('./models');

const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Database Connection
// =====================
(async () => {
  try {
    await db.authenticate();
    console.log('Database connected successfully');

    // Prevent heavy sync alter operations on Vercel unless explicitly requested
    if (!process.env.VERCEL || process.env.SYNC_DATABASE === 'true') {
      await db.sync({ alter: true });
      console.log('Database synced');
    } else {
      console.log('Database sync skipped on Vercel (SYNC_DATABASE is not set to true)');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

const path = require('path');

// =====================
// Routes
// =====================
// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/estimates', require('./routes/estimates'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve Static Assets in Production (Vercel)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('EventEase API is running...');
  });
}

// =====================
// Start Server
// =====================
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
