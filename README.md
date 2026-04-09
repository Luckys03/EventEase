# EventEase - Smart Event & Venue Booking System

A modern full-stack web application for event and venue booking with user authentication, booking management, and password reset functionality.

## 🚀 Features

- **User Authentication**: Register, login, and secure password management
- **Password Reset**: Forgot password functionality with email verification
- **Venue Management**: Browse, search, and filter event venues
- **Booking System**: Create, manage, and track event bookings
- **User Roles**: Support for users, vendors, and administrators
- **Responsive Design**: Mobile-friendly interface with dark/light themes
- **Real-time Updates**: Live booking status updates

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 19** with React Router
- **Axios** for API communication
- **Tailwind CSS** for styling
- **React Testing Library** for testing

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd EventEase
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Database Setup
1. Create a PostgreSQL database named `eventease`
2. Update the database credentials in your `.env` file
3. The application will automatically sync the database schema on startup

### 5. Start the Application

#### Development Mode (Recommended)
```bash
npm run dev
```
This will start both the backend server (port 5000) and frontend client (port 3000) concurrently.

#### Individual Services
```bash
# Start backend only
npm run server

# Start frontend only (in another terminal)
npm run client
```

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token
- `GET /api/users/me` - Get current user profile (protected)

### Venues
- `GET /api/venues` - Get all venues
- `POST /api/venues` - Create new venue
- `GET /api/venues/:id` - Get venue by ID
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 📁 Project Structure

```
EventEase/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── api.js         # API configuration
│   │   └── App.js         # Main App component
│   └── package.json
├── config/                # Database configuration
├── controllers/           # Route controllers
├── middleware/            # Express middleware
├── models/               # Sequelize models
├── routes/               # API routes
├── utils/                # Utility functions
├── server.js             # Express server
├── package.json          # Backend dependencies
└── README.md
```

## 🔐 Environment Variables

Key environment variables to configure in `.env`:

```env
NODE_ENV=development
PORT=5000
DB_NAME=eventease
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

## 📧 Email Configuration

The password reset feature includes email functionality. Currently, it logs emails to the console for development. For production:

1. Configure SMTP settings in `.env`
2. Uncomment the email service code in `utils/email.js`
3. Consider using services like SendGrid or AWS SES

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests (when implemented)
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Considerations
- Set `NODE_ENV=production`
- Use a production database
- Configure proper email service
- Set up HTTPS
- Configure CORS for your domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Issues

If you encounter any issues or have suggestions, please create an issue on the GitHub repository.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for seamless event management**
