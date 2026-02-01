# Email Configuration Guide

## ✅ What's Been Added

Email confirmation functionality has been implemented with the following features:

### Backend
- ✅ Email verification tokens in database
- ✅ Nodemailer SMTP integration
- ✅ Email service with templates (German & English)
- ✅ Auth endpoints for verification
- ✅ Automatic emails on registration
- ✅ Welcome email after verification
- ✅ Password reset email support

### Frontend
- ✅ Email verification page (`/verify-email`)
- ✅ Router integration

### Email Types
1. **Verification Email** - Sent on registration with 24-hour token
2. **Welcome Email** - Sent after successful verification
3. **Password Reset Email** - Ready for future implementation

## 🔧 SMTP Configuration

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and generate password
   - Copy the 16-character password

3. **Update `.env` file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@nordsee-booking.com
EMAIL_FROM_NAME=Nordsee Booking
APP_URL=http://localhost:8080
```

### Option 2: Other SMTP Providers

**SendGrid**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun**:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

**AWS SES**:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-access-key-id
SMTP_PASSWORD=your-aws-secret-access-key
```

### Option 3: Development (Mailtrap)

For testing without sending real emails:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
```

Sign up at https://mailtrap.io for a free account.

## 🚀 Testing Email Verification

### 1. Update Environment Variables

```bash
# Copy the updated example
cp .env.example .env

# Edit .env with your SMTP settings
nano .env  # or use your preferred editor
```

### 2. Restart Docker Containers

```bash
docker-compose down
docker-compose up -d --build
```

### 3. Test Registration Flow

1. **Register a new user**:
   - Go to http://localhost:8080/register
   - Fill in the registration form
   - Submit

2. **Check logs for email status**:
```bash
docker-compose logs app | grep -i email
```

You should see:
- `✅ SMTP server is ready to send emails` (on startup)
- `✅ Verification email sent to user@example.com` (after registration)

3. **Check your email** (or Mailtrap inbox)

4. **Click verification link** or manually visit:
   ```
   http://localhost:8080/verify-email?token=<token>
   ```

5. **Verify success**:
   - Should see "Email verified successfully!" page
   - Check logs: `✅ Welcome email sent to user@example.com`

## 📧 API Endpoints

### POST /api/auth/register
Register a new user and send verification email.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "Max",
  "last_name": "Mustermann",
  "phone": "+49123456789",
  "role": "guest"
}
```

**Response**:
```json
{
  "message": "Registrierung erfolgreich",
  "user": { ... },
  "token": "jwt-token",
  "emailVerificationSent": true
}
```

### GET /api/auth/verify-email?token=<token>
Verify email address with token.

**Response**:
```json
{
  "message": "E-Mail erfolgreich bestätigt!",
  "verified": true
}
```

### POST /api/auth/resend-verification
Resend verification email if expired.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "Bestätigungs-E-Mail wurde gesendet"
}
```

### POST /api/auth/login
Login (works even if email not verified).

### GET /api/auth/me
Get current user info (requires authentication).

## 🔒 Security Features

- **Verification tokens**: 64-character random hex strings
- **Token expiration**: 24 hours
- **One-time use**: Tokens are deleted after verification
- **Secure generation**: Using Node.js crypto module
- **HTML templates**: Professional, responsive design

## 🎨 Email Templates

All emails include:
- Branded header with gradient
- Clear call-to-action buttons
- Fallback links (for email clients that block buttons)
- Responsive design
- Footer with copyright
- Bilingual support (German & English)

## 🐛 Troubleshooting

### SMTP Connection Failed

**Error**: `❌ SMTP connection failed`

**Solutions**:
1. Check SMTP credentials in `.env`
2. For Gmail: Ensure app password is correct (not regular password)
3. Check firewall/network settings
4. Verify SMTP_PORT and SMTP_SECURE settings

### Email Not Received

1. **Check spam folder**
2. **Check logs**:
   ```bash
   docker-compose logs app | grep -i "email\|smtp"
   ```
3. **For Gmail**: Check "Less secure app access" is NOT needed (use app passwords)
4. **Verify email service** is not blocking Docker IPs

### Token Expired

- Tokens expire after 24 hours
- Use the "Resend verification" endpoint
- Or register again with same email (will update token)

### SMTP Not Working But Want to Test

**Option 1**: Use Mailtrap (recommended)
**Option 2**: Check token in database directly:

```bash
docker-compose exec db mysql -u nordsee_user -p nordsee_booking

SELECT email, verification_token FROM users WHERE email = 'user@example.com';
```

Then manually visit: `http://localhost:8080/verify-email?token=<token>`

## 📊 Database Changes

New columns added to `users` table:
- `verification_token` (VARCHAR 64, nullable)
- `verification_token_expires` (TIMESTAMP, nullable)

These are automatically added via migration on startup.

## 🔄 Future Enhancements

Ready to implement:
- ✅ Password reset functionality (templates ready)
- ⏳ Booking confirmation emails
- ⏳ Booking reminder emails (24h before check-in)
- ⏳ Email preferences/unsubscribe
- ⏳ Email templates for hosts (booking requests)

## 📝 Notes

- **Development**: SMTP is optional - registration still works without it
- **Production**: Configure proper SMTP service (SendGrid, AWS SES, etc.)
- **Rate Limiting**: Consider implementing email rate limits in production
- **Logging**: All email operations are logged for debugging
- **Error Handling**: Emails failures don't block registration

---

**Email verification is now fully functional!** 📬
