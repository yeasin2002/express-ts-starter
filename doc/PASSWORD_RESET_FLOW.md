# Password Reset Flow Documentation

## Overview

The password reset flow has been updated to include a separate OTP verification step before allowing password reset. This provides better UX and security.

## Flow Diagram

```
┌─────────────────────┐
│  1. Forgot Password │
│  POST /forgot-password
│  { email }         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OTP Sent via Email │
│  (6-digit code)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Verify OTP      │
│  POST /verify-otp   │
│  { email, otp }     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OTP Verified ✓     │
│  Show reset form    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Reset Password  │
│  POST /reset-password
│  { email, otp,     │
│    newPassword }    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Password Reset ✓   │
│  Redirect to Login  │
└─────────────────────┘
```

## API Endpoints

### 1. Request OTP (Forgot Password)

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "If the email exists, an OTP has been sent",
  "data": null
}
```

**Notes:**
- OTP is 6 digits
- OTP expires in 15 minutes
- OTP is currently logged to console (integrate email service)
- Response doesn't reveal if email exists (security)

---

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": null
}
```

**Error Responses:**

**Invalid OTP (400):**
```json
{
  "status": 400,
  "message": "Invalid OTP",
  "data": null
}
```

**OTP Expired (400):**
```json
{
  "status": 400,
  "message": "OTP has expired. Please request a new one.",
  "data": null
}
```

**OTP Already Used (400):**
```json
{
  "status": 400,
  "message": "OTP has already been used",
  "data": null
}
```

**No OTP Found (400):**
```json
{
  "status": 400,
  "message": "No OTP found. Please request a new one.",
  "data": null
}
```

---

### 3. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "Password reset successfully. Please login with your new password.",
  "data": null
}
```

**Error Responses:**
Same as verify OTP endpoint, plus validation errors for password.

**Notes:**
- OTP is verified again for security
- OTP is marked as used after successful reset
- All refresh tokens are invalidated
- User must login with new password

---

## Complete Flow Example

### Step 1: Request OTP

```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

**Response:**
```json
{
  "status": 200,
  "message": "If the email exists, an OTP has been sent",
  "data": null
}
```

**Console Output (Development):**
```
OTP for john@example.com: 123456
```

---

### Step 2: Verify OTP

```bash
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "otp":"123456"
  }'
```

**Response:**
```json
{
  "status": 200,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": null
}
```

---

### Step 3: Reset Password

```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "otp":"123456",
    "newPassword":"newSecurePassword123"
  }'
```

**Response:**
```json
{
  "status": 200,
  "message": "Password reset successfully. Please login with your new password.",
  "data": null
}
```

---

## Mobile App Implementation

### Flutter Example

```dart
class PasswordResetFlow {
  final ApiService _api;
  
  // Step 1: Request OTP
  Future<void> requestOTP(String email) async {
    final response = await _api.post('/auth/forgot-password', {
      'email': email,
    });
    
    if (response.status == 200) {
      // Show success message
      showSnackbar('OTP sent to your email');
      // Navigate to OTP verification screen
      navigateToOTPScreen(email);
    }
  }
  
  // Step 2: Verify OTP
  Future<bool> verifyOTP(String email, String otp) async {
    final response = await _api.post('/auth/verify-otp', {
      'email': email,
      'otp': otp,
    });
    
    if (response.status == 200) {
      // OTP verified, navigate to reset password screen
      navigateToResetPasswordScreen(email, otp);
      return true;
    } else {
      // Show error message
      showError(response.message);
      return false;
    }
  }
  
  // Step 3: Reset Password
  Future<void> resetPassword(String email, String otp, String newPassword) async {
    final response = await _api.post('/auth/reset-password', {
      'email': email,
      'otp': otp,
      'newPassword': newPassword,
    });
    
    if (response.status == 200) {
      // Password reset successful
      showSuccess('Password reset successfully');
      // Navigate to login screen
      navigateToLogin();
    } else {
      showError(response.message);
    }
  }
}
```

### React/Web Example

```typescript
// Step 1: Request OTP
const handleForgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    
    if (response.status === 200) {
      toast.success('OTP sent to your email');
      navigate('/verify-otp', { state: { email } });
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Step 2: Verify OTP
const handleVerifyOTP = async (email: string, otp: string) => {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    
    if (response.status === 200) {
      toast.success('OTP verified successfully');
      navigate('/reset-password', { state: { email, otp } });
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Step 3: Reset Password
const handleResetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  try {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    
    if (response.status === 200) {
      toast.success('Password reset successfully');
      navigate('/login');
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## Security Features

### OTP Security
- ✅ 6-digit random code
- ✅ 15-minute expiration
- ✅ One-time use only
- ✅ Stored securely in database
- ✅ Verified at both verify and reset steps

### Password Reset Security
- ✅ OTP must be verified before reset
- ✅ All refresh tokens invalidated
- ✅ User must login with new password
- ✅ Doesn't reveal if email exists
- ✅ Rate limiting recommended (add later)

---

## Error Handling

### Common Errors

| Error | Status | Message | Solution |
|-------|--------|---------|----------|
| Invalid email | 400 | Validation error | Check email format |
| Invalid OTP | 400 | Invalid OTP | Re-enter correct OTP |
| OTP expired | 400 | OTP has expired | Request new OTP |
| OTP used | 400 | OTP has already been used | Request new OTP |
| No OTP | 400 | No OTP found | Request OTP first |
| Weak password | 400 | Password must be at least 6 characters | Use stronger password |

### Error Response Format

```json
{
  "status": 400,
  "message": "Error message here",
  "data": null
}
```

---

## Testing

### Test Sequence

1. **Request OTP**
   ```bash
   POST /api/auth/forgot-password
   { "email": "test@example.com" }
   ```
   ✅ Check console for OTP

2. **Verify OTP (Valid)**
   ```bash
   POST /api/auth/verify-otp
   { "email": "test@example.com", "otp": "123456" }
   ```
   ✅ Should return success

3. **Verify OTP (Invalid)**
   ```bash
   POST /api/auth/verify-otp
   { "email": "test@example.com", "otp": "000000" }
   ```
   ❌ Should return error

4. **Reset Password**
   ```bash
   POST /api/auth/reset-password
   {
     "email": "test@example.com",
     "otp": "123456",
     "newPassword": "newPassword123"
   }
   ```
   ✅ Should reset password

5. **Try to Use OTP Again**
   ```bash
   POST /api/auth/verify-otp
   { "email": "test@example.com", "otp": "123456" }
   ```
   ❌ Should return "OTP has already been used"

6. **Login with New Password**
   ```bash
   POST /api/auth/login
   {
     "email": "test@example.com",
     "password": "newPassword123"
   }
   ```
   ✅ Should login successfully

---

## HTTP Test File

Create `api-client/password-reset.http`:

```http
### 1. Request OTP
POST http://localhost:4000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

### 2. Verify OTP (use OTP from console)
POST http://localhost:4000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

### 3. Reset Password
POST http://localhost:4000/api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}

### 4. Login with New Password
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "newSecurePassword123"
}

### Error Cases

### Invalid OTP
POST http://localhost:4000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "000000"
}

### Try to use OTP twice
POST http://localhost:4000/api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "anotherPassword123"
}
```

---

## Next Steps

### 1. Integrate Email Service
Replace console.log with actual email sending:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: process.env.SMTP_USER,
  to: user.email,
  subject: 'Password Reset OTP',
  html: `
    <h1>Password Reset</h1>
    <p>Your OTP code is: <strong>${otp}</strong></p>
    <p>This code will expire in 15 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `,
});
```

### 2. Add Rate Limiting
Prevent brute force attacks:

```typescript
import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: 'Too many OTP requests, please try again later',
});

auth.post('/forgot-password', otpLimiter, validateBody(ForgotPasswordSchema), forgotPassword);
auth.post('/verify-otp', otpLimiter, validateBody(VerifyOTPSchema), verifyOTP);
```

### 3. Add OTP Resend Endpoint
Allow users to request a new OTP:

```typescript
auth.post('/resend-otp', validateBody(ForgotPasswordSchema), forgotPassword);
```

---

**Password reset flow is complete and ready to use!** 🎉

The three-step flow (Request → Verify → Reset) provides better UX and security.
