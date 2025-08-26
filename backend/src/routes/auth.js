const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { generateTokens } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  body('website').optional().isURL().withMessage('Please enter a valid website URL'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().trim(),
  body('country').optional().trim(),
  body('taxId').optional().trim(),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
  body('timezone').optional().trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      company,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      taxId,
      currency = 'USD',
      timezone = 'UTC'
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User already exists with this email'
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company,
        phone,
        website,
        address,
        city,
        state,
        zipCode,
        country,
        taxId,
        currency,
        timezone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        logo: true,
        currency: true,
        timezone: true,
        createdAt: true
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Create default invoice template for the user
    await prisma.template.create({
      data: {
        name: 'Default Template',
        description: 'Default invoice template',
        html: getDefaultTemplateHTML(),
        css: getDefaultTemplateCSS(),
        isDefault: true,
        isActive: true,
        userId: user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error'
      }
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials'
        }
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials'
        }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Return user data (without password) and tokens
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      logo: user.logo,
      currency: user.currency,
      timezone: user.timezone,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error'
      }
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token is required'
        }
      });
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        logo: true,
        currency: true,
        timezone: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Generate new tokens
    const newTokens = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user,
        tokens: newTokens
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid refresh token'
      }
    });
  }
});

// Helper functions for default template
function getDefaultTemplateHTML() {
  return `
    <div class="invoice-template">
      <div class="header">
        <div class="company-info">
          <h1>{{companyName}}</h1>
          <p>{{companyAddress}}</p>
        </div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> {{invoiceNumber}}</p>
          <p><strong>Date:</strong> {{issueDate}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
        </div>
      </div>
      
      <div class="client-info">
        <h3>Bill To:</h3>
        <p>{{clientName}}</p>
        <p>{{clientAddress}}</p>
      </div>
      
      <div class="items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{description}}</td>
              <td>{{quantity}}</td>
              <td>{{unitPrice}}</td>
              <td>{{total}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
      
      <div class="totals">
        <p><strong>Subtotal:</strong> {{subtotal}}</p>
        <p><strong>Tax ({{taxRate}}%):</strong> {{taxAmount}}</p>
        <p><strong>Total:</strong> {{total}}</p>
      </div>
      
      <div class="footer">
        <p>{{notes}}</p>
        <p>{{terms}}</p>
      </div>
    </div>
  `;
}

function getDefaultTemplateCSS() {
  return `
    .invoice-template {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    
    .company-info h1 {
      color: #333;
      margin: 0 0 10px 0;
    }
    
    .invoice-info h2 {
      color: #333;
      margin: 0 0 15px 0;
    }
    
    .client-info {
      margin-bottom: 30px;
    }
    
    .client-info h3 {
      color: #333;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    .totals {
      text-align: right;
      margin-bottom: 30px;
    }
    
    .totals p {
      margin: 5px 0;
    }
    
    .footer {
      border-top: 1px solid #ccc;
      padding-top: 20px;
      font-size: 14px;
      color: #666;
    }
  `;
}

module.exports = router;
