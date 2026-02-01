const transporter = require('../config/email');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.from = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`;
    this.appUrl = process.env.APP_URL || 'http://localhost:8080';
  }

  /**
   * Generate a secure verification token
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user, token, language = 'de') {
    const verificationUrl = `${this.appUrl}/verify-email?token=${token}`;
    
    const subject = language === 'de' 
      ? 'Bestätigen Sie Ihre E-Mail-Adresse'
      : 'Verify Your Email Address';

    const html = language === 'de' 
      ? this.getGermanVerificationTemplate(user, verificationUrl)
      : this.getEnglishVerificationTemplate(user, verificationUrl);

    try {
      await transporter.sendMail({
        from: this.from,
        to: user.email,
        subject,
        html
      });
      console.log(`✅ Verification email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(user, language = 'de') {
    const subject = language === 'de' 
      ? 'Willkommen bei Nordsee Booking!'
      : 'Welcome to Nordsee Booking!';

    const html = language === 'de'
      ? this.getGermanWelcomeTemplate(user)
      : this.getEnglishWelcomeTemplate(user);

    try {
      await transporter.sendMail({
        from: this.from,
        to: user.email,
        subject,
        html
      });
      console.log(`✅ Welcome email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, token, language = 'de') {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;
    
    const subject = language === 'de' 
      ? 'Passwort zurücksetzen'
      : 'Reset Your Password';

    const html = language === 'de'
      ? this.getGermanPasswordResetTemplate(user, resetUrl)
      : this.getEnglishPasswordResetTemplate(user, resetUrl);

    try {
      await transporter.sendMail({
        from: this.from,
        to: user.email,
        subject,
        html
      });
      console.log(`✅ Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      throw new Error('Failed to send password reset email');
    }
  }

  // German Templates
  getGermanVerificationTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌊 Nordsee Booking</h1>
          </div>
          <div class="content">
            <h2>Hallo ${user.first_name}!</h2>
            <p>Vielen Dank für Ihre Registrierung bei Nordsee Booking.</p>
            <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren:</p>
            <center>
              <a href="${verificationUrl}" class="button">E-Mail bestätigen</a>
            </center>
            <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Dieser Link ist 24 Stunden gültig. Wenn Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Nordsee Booking. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEnglishVerificationTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌊 Nordsee Booking</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>Thank you for registering with Nordsee Booking.</p>
            <p>Please verify your email address to activate your account:</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </center>
            <p>Or copy this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              This link is valid for 24 hours. If you didn't register, you can ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Nordsee Booking. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getGermanWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Willkommen bei Nordsee Booking!</h1>
          </div>
          <div class="content">
            <h2>Hallo ${user.first_name}!</h2>
            <p>Ihre E-Mail-Adresse wurde erfolgreich bestätigt. Ihr Konto ist jetzt aktiv!</p>
            <p>Sie können jetzt:</p>
            <ul>
              <li>🏖️ Traumhafte Unterkünfte an der Nordsee suchen und buchen</li>
              <li>🏠 Als Vermieter Ihre eigenen Unterkünfte anbieten</li>
              <li>⭐ Bewertungen schreiben und lesen</li>
            </ul>
            <center>
              <a href="${this.appUrl}" class="button">Jetzt starten</a>
            </center>
            <p>Wir wünschen Ihnen viel Freude mit Nordsee Booking!</p>
          </div>
          <div class="footer">
            <p>© 2026 Nordsee Booking. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEnglishWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Nordsee Booking!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>Your email address has been successfully verified. Your account is now active!</p>
            <p>You can now:</p>
            <ul>
              <li>🏖️ Search and book amazing accommodations on the North Sea</li>
              <li>🏠 List your own properties as a host</li>
              <li>⭐ Write and read reviews</li>
            </ul>
            <center>
              <a href="${this.appUrl}" class="button">Get Started</a>
            </center>
            <p>We hope you enjoy using Nordsee Booking!</p>
          </div>
          <div class="footer">
            <p>© 2026 Nordsee Booking. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getGermanPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Passwort zurücksetzen</h1>
          </div>
          <div class="content">
            <h2>Hallo ${user.first_name}!</h2>
            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten.</p>
            <p>Klicken Sie auf den Button, um ein neues Passwort zu erstellen:</p>
            <center>
              <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
            </center>
            <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Dieser Link ist 1 Stunde gültig. Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Nordsee Booking. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEnglishPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>You have requested to reset your password.</p>
            <p>Click the button below to create a new password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              This link is valid for 1 hour. If you didn't request this, you can ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Nordsee Booking. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
