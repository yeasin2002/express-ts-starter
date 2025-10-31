# Email Setup Guide

## Overview

JobSphere uses Nodemailer with Gmail SMTP to send emails for OTP verification and other notifications.

## Gmail SMTP Configuration

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Create App Password

1. Go to **Security** → **2-Step Verification**
2. Scroll down to **App passwords**
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other (Custom name)**
5. Enter "JobSphere" or any name
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

**Important:**

- Remove spaces from the app password
- Don't use your regular Gmail password
- Keep this password secret

## Email Functions

### 1. Send OTP Email

**Function:** `sendOTPEmail(email, otp, name?)`

**Usage:**

```typescript
import { sendOTPEmail } from "@/lib/nodemailer";

await sendOTPEmail("user@example.com", "123456", "John Doe");
```

**Email Preview:**

```
Subject: Password Reset OTP - JobSphere

Hi John Doe,

We received a request to reset your password. Use the OTP code below:

┌─────────────────┐
│    123456       │
└─────────────────┘

This OTP will expire in 15 minutes.

If you didn't request this, please ignore this email.
```

### 2. Send Welcome Email

**Function:** `sendWelcomeEmail(email, name)`

**Usage:**

```typescript
import { sendWelcomeEmail } from "@/lib/nodemailer";

await sendWelcomeEmail("user@example.com", "John Doe");
```

**Email Preview:**

```
Subject: Welcome to JobSphere!

Hi John Doe! 👋

Thank you for joining JobSphere! We're excited to have you on board.

JobSphere connects customers with skilled local contractors.
```

## Email Templates

### OTP Email Features

- ✅ Professional HTML design
- ✅ Responsive layout
- ✅ Large, easy-to-read OTP code
- ✅ Expiration time clearly stated
- ✅ Security warning included
- ✅ Plain text fallback
- ✅ Branded with JobSphere colors

### Welcome Email Features

- ✅ Friendly greeting
- ✅ Brief introduction to JobSphere
- ✅ Professional design
- ✅ Plain text fallback

## Testing Email Sending

### Test 1: Send OTP Email

```typescript
// In your code or test file
import { sendOTPEmail } from "@/lib/nodemailer";

try {
  await sendOTPEmail("test@example.com", "123456", "Test User");
  console.log("✅ Email sent successfully");
} catch (error) {
  console.error("❌ Email failed:", error);
}
```

### Test 2: Test via API

```bash
# Request OTP
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'

# Check your email inbox for OTP
```

### Test 3: Check Console Logs

The forgot password handler logs OTP to console:

- ✅ Success: `✅ OTP sent to email@example.com: 123456`
- ⚠️ Failure: `⚠️ Email failed. OTP for email@example.com: 123456`

## Error Handling

### Common Errors

#### 1. Invalid Credentials

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution:**

- Verify SMTP_USER is correct
- Verify SMTP_PASS is the App Password (not regular password)
- Ensure 2FA is enabled
- Regenerate App Password if needed

#### 2. Less Secure Apps

```
Error: Please log in via your web browser
```

**Solution:**

- Use App Password instead of regular password
- Don't enable "Less secure app access" (deprecated)

#### 3. Daily Limit Exceeded

```
Error: 550 5.4.5 Daily sending quota exceeded
```

**Solution:**

- Gmail free accounts: ~500 emails/day
- Wait 24 hours or upgrade to Google Workspace
- Consider using SendGrid, AWS SES, or Mailgun for production

#### 4. Connection Timeout

```
Error: Connection timeout
```

**Solution:**

- Check internet connection
- Verify firewall isn't blocking port 587
- Try port 465 (SSL) instead

## Gmail Sending Limits

| Account Type     | Daily Limit      |
| ---------------- | ---------------- |
| Free Gmail       | ~500 emails/day  |
| Google Workspace | 2,000 emails/day |

**Recommendations:**

- Development: Gmail is fine
- Production: Use dedicated email service (SendGrid, AWS SES, Mailgun)

## Alternative Email Services

### For Production Use

#### 1. SendGrid

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: "noreply@jobsphere.com",
  subject: "Password Reset OTP",
  html: emailHtml,
});
```

**Pros:**

- 100 emails/day free
- 40,000 emails/month on paid plan
- Better deliverability
- Email analytics

#### 2. AWS SES

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ region: "us-east-1" });

await client.send(
  new SendEmailCommand({
    Source: "noreply@jobsphere.com",
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Password Reset OTP" },
      Body: { Html: { Data: emailHtml } },
    },
  })
);
```

**Pros:**

- Very cheap ($0.10 per 1,000 emails)
- Highly scalable
- Reliable infrastructure

#### 3. Mailgun

```typescript
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

await mg.messages.create("sandbox.mailgun.org", {
  from: "JobSphere <noreply@jobsphere.com>",
  to: [email],
  subject: "Password Reset OTP",
  html: emailHtml,
});
```

**Pros:**

- 5,000 emails/month free
- Good documentation
- Easy to use

## Email Best Practices

### 1. Use Professional From Address

```typescript
from: '"JobSphere" <noreply@jobsphere.com>';
```

### 2. Include Plain Text Version

Always provide both HTML and plain text versions for email clients that don't support HTML.

### 3. Keep Emails Concise

- Clear subject line
- Brief, scannable content
- Single call-to-action

### 4. Test Across Email Clients

- Gmail
- Outlook
- Apple Mail
- Mobile devices

### 5. Monitor Deliverability

- Check spam folder
- Monitor bounce rates
- Use email verification services

### 6. Respect User Preferences

- Include unsubscribe link (for marketing emails)
- Honor opt-out requests
- Don't send too frequently

## Security Considerations

### 1. Never Log Sensitive Data

```typescript
// ❌ Bad
console.log("Sending email with password:", password);

// ✅ Good
console.log("Sending email to:", email);
```

### 2. Use Environment Variables

```typescript
// ❌ Bad
const transporter = nodemailer.createTransport({
  auth: {
    user: "myemail@gmail.com",
    pass: "mypassword123",
  },
});

// ✅ Good
const transporter = nodemailer.createTransport({
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

### 3. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from "express-rate-limit";

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 emails per window
  message: "Too many email requests, please try again later",
});

router.post("/forgot-password", emailLimiter, forgotPassword);
```

### 4. Validate Email Addresses

```typescript
import { z } from "zod";

const emailSchema = z.string().email();

if (!emailSchema.safeParse(email).success) {
  throw new Error("Invalid email address");
}
```

## Troubleshooting

### Email Not Received?

1. **Check spam folder**
2. **Verify email address is correct**
3. **Check console logs for errors**
4. **Verify SMTP credentials**
5. **Check Gmail sending limits**
6. **Wait a few minutes (email delays)**

### Email Looks Broken?

1. **Test in different email clients**
2. **Check HTML syntax**
3. **Use inline CSS (not external stylesheets)**
4. **Test plain text version**

### Slow Email Sending?

1. **Use async/await properly**
2. **Don't wait for email in critical path**
3. **Consider background job queue**
4. **Use email service with better performance**

## Monitoring

### Log Email Events

```typescript
try {
  await sendOTPEmail(email, otp, name);
  console.log(`✅ OTP email sent to ${email}`);
} catch (error) {
  console.error(`❌ Failed to send OTP email to ${email}:`, error);
  // Log to error tracking service (Sentry, etc.)
}
```

### Track Email Metrics

- Sent count
- Delivery rate
- Open rate (if using tracking pixels)
- Click rate (for links)
- Bounce rate
- Spam complaints

## Production Checklist

- [ ] Use App Password (not regular password)
- [ ] Store credentials in environment variables
- [ ] Test email sending in staging
- [ ] Monitor sending limits
- [ ] Set up error logging
- [ ] Consider dedicated email service
- [ ] Implement rate limiting
- [ ] Test across email clients
- [ ] Set up SPF/DKIM/DMARC records
- [ ] Monitor deliverability metrics

---

**Your email system is ready!** 🎉

Start testing with Gmail SMTP and migrate to a dedicated service for production.
