require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

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

    await db.sync({ alter: true });
    console.log('Database synced');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

// =====================
// Routes
// =====================
app.get('/', (req, res) => {
  res.send('EventEase API is running...');
});

// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/vendors', require('./routes/vendors'));

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
