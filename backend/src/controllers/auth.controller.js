const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const jwtConfig = require('../config/jwt');
const emailService = require('../services/emailService');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({
          error: { message: req.t('error.email_exists') }
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

      // Generate verification token
      const verification_token = emailService.generateVerificationToken();
      const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const [userId] = await db('users').insert({
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        role: role || 'guest',
        verified: false,
        verification_token,
        verification_token_expires
      });

      // Get created user
      const user = await db('users').where({ id: userId }).first();

      // Send verification email
      try {
        await emailService.sendVerificationEmail(
          user, 
          verification_token, 
          req.language || 'de'
        );
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with registration even if email fails
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn, issuer: jwtConfig.issuer }
      );

      // Remove sensitive data
      delete user.password_hash;
      delete user.verification_token;

      res.status(201).json({
        message: req.t('auth.registration_successful'),
        user,
        token,
        emailVerificationSent: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: { message: req.t('error.internal_server_error') }
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(401).json({
          error: { message: req.t('error.invalid_credentials') }
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: { message: req.t('error.invalid_credentials') }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn, issuer: jwtConfig.issuer }
      );

      // Remove sensitive data
      delete user.password_hash;
      delete user.verification_token;

      res.json({
        message: req.t('auth.login_successful'),
        user,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: { message: req.t('error.internal_server_error') }
      });
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          error: { message: 'Verification token is required' }
        });
      }

      // Find user with this token
      const user = await db('users')
        .where({ verification_token: token })
        .where('verification_token_expires', '>', new Date())
        .first();

      if (!user) {
        return res.status(400).json({
          error: { message: req.t('error.invalid_or_expired_token') }
        });
      }

      // Mark user as verified
      await db('users')
        .where({ id: user.id })
        .update({
          verified: true,
          verification_token: null,
          verification_token_expires: null
        });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user, req.language || 'de');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      res.json({
        message: req.t('auth.email_verified'),
        verified: true
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        error: { message: req.t('error.internal_server_error') }
      });
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      // Find user
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(404).json({
          error: { message: req.t('error.user_not_found') }
        });
      }

      if (user.verified) {
        return res.status(400).json({
          error: { message: req.t('error.already_verified') }
        });
      }

      // Generate new verification token
      const verification_token = emailService.generateVerificationToken();
      const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update user
      await db('users')
        .where({ id: user.id })
        .update({ verification_token, verification_token_expires });

      // Send verification email
      await emailService.sendVerificationEmail(
        user,
        verification_token,
        req.language || 'de'
      );

      res.json({
        message: req.t('auth.verification_email_sent')
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        error: { message: req.t('error.internal_server_error') }
      });
    }
  }

  /**
   * Get current user
   */
  async me(req, res) {
    try {
      const user = await db('users').where({ id: req.user.id }).first();
      
      if (!user) {
        return res.status(404).json({
          error: { message: req.t('error.user_not_found') }
        });
      }

      // Remove sensitive data
      delete user.password_hash;
      delete user.verification_token;

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: { message: req.t('error.internal_server_error') }
      });
    }
  }
}

module.exports = new AuthController();
