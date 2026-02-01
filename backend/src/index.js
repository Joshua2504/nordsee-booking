require('dotenv').config({ path: '../.env' });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize i18next
i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/translation.json')
    },
    fallbackLng: 'de',
    supportedLngs: ['de', 'en'],
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie']
    },
    preload: ['de', 'en']
  });

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18nextMiddleware.handle(i18next));

// Static files - serve uploaded images
app.use('/uploads', express.static(path.join('/data/uploads')));

// Serve Vue.js frontend in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({ 
    message: req.t('welcome'),
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/properties', require('./routes/property.routes'));
// app.use('/api/bookings', require('./routes/booking.routes'));
// app.use('/api/availability', require('./routes/availability.routes'));
// app.use('/api/search', require('./routes/search.routes'));
// app.use('/api/amenities', require('./routes/amenity.routes'));

// Serve Vue.js app for all other routes in production (must be before error handler)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
}

// Error handler middleware (will be implemented later)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || req.t('error.internal_server_error'),
      status: err.status || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
