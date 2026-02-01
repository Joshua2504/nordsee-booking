const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('⚠️  Email verification will not work. Please check SMTP settings.');
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

module.exports = transporter;
