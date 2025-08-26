const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const invoiceRoutes = require('./routes/invoices');
const templateRoutes = require('./routes/templates');
const emailRoutes = require('./routes/email');

const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization middleware
app.use(mongoSanitize());
app.use(xssClean());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Invoice Generator API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/templates', authenticateToken, templateRoutes);
app.use('/api/email', authenticateToken, emailRoutes);

// API documentation
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Invoice Generator API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/logout': 'User logout'
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'PUT /api/users/password': 'Change password'
      },
      clients: {
        'GET /api/clients': 'Get all clients',
        'POST /api/clients': 'Create new client',
        'GET /api/clients/:id': 'Get client by ID',
        'PUT /api/clients/:id': 'Update client',
        'DELETE /api/clients/:id': 'Delete client'
      },
      invoices: {
        'GET /api/invoices': 'Get all invoices',
        'POST /api/invoices': 'Create new invoice',
        'GET /api/invoices/:id': 'Get invoice by ID',
        'PUT /api/invoices/:id': 'Update invoice',
        'DELETE /api/invoices/:id': 'Delete invoice',
        'POST /api/invoices/:id/send': 'Send invoice via email',
        'GET /api/invoices/:id/pdf': 'Download invoice as PDF'
      },
      templates: {
        'GET /api/templates': 'Get all templates',
        'POST /api/templates': 'Create new template',
        'GET /api/templates/:id': 'Get template by ID',
        'PUT /api/templates/:id': 'Update template',
        'DELETE /api/templates/:id': 'Delete template'
      },
      email: {
        'POST /api/email/send': 'Send custom email',
        'POST /api/email/reminder': 'Send payment reminder'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Invoice Generator API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
