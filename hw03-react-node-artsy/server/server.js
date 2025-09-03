const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();
const connectDB = require('./db');
const cookieParser = require('cookie-parser');

console.log('Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Connect to database
console.log('Connecting to MongoDB...');
connectDB()
  .then(() => {
    console.log('MongoDB connection initialized');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Middleware
app.use(cookieParser());
app.use(express.json());
// Configure CORS
app.use(cors({
  origin: true, // Allow any origin in development
  credentials: true // Allow credentials (cookies)
}));

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware for API routes
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Serve static files from React build
const buildPath = path.join(__dirname, '../client/build');
const fs = require('fs');

// Check if build folder exists
if (fs.existsSync(buildPath)) {
  console.log('Serving static files from:', buildPath);
  app.use(express.static(buildPath));
} else {
  console.warn('Warning: Build folder not found at', buildPath);
  console.warn('Static files will not be served correctly.');
  console.warn('Make sure to run "npm run build" in the client directory.');
}

// Handle React routing, return all requests to React app
// This is crucial for client-side routing with React Router
// It ensures that deep links like /artist/123 work correctly even on first visit or page refresh
app.get('*', (req, res, next) => {
  const indexPath = path.resolve(__dirname, '../client/build', 'index.html');

  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        next(err); // Let the error handler deal with it
      }
    });
  } else {
    console.error('Error: index.html not found at', indexPath);
    res.status(404).send('Not found: The application build files are missing. Please make sure to build the React app.');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
