# Core Features

## Real-Time Communication

### WebSocket Chat System

- Real-time messaging between Customers and Contractors
- No voice/video call functionality
- Native WebSocket implementation
- Features:
  - One-to-one chat rooms
  - Message history persistence with database
  - Online/offline status
  - Typing indicators
  - Message read receipts
  - File sharing in chat (images, documents) and store them in database (after uploading to  storage)

###  Email Sending with nodemailer 
-  Send Email for OTP verification

### Push Notifications

- Mobile push notifications for Flutter app - Backend Firebase
- Notification triggers:
  - New job posted (for contractors)
  - Job application received (for customers)
  - Booking confirmed/declined
  - New message received
  - Payment received/released
  - Job completed
  - Review submitted
- Integration with Pusher or similar service
- Store notification preferences per user

## File Upload System

### Current Implementation

- **Storage Location**: `/upload` folder in project root
- **Future Migration**: AWS S3 or other cloud storage planned
- **Supported File Types**:
  - Profile images (customers, contractors)
  - Portfolio images (contractors)
  - Job-related documents and images
  - Chat attachments
  - Proof of work images

### Upload Features

- File size validation
- File type validation (images, PDFs, documents)
- Unique filename generation
- Secure file access control
- Image optimization/compression (optional)

### API Endpoints

- `POST /api/upload` - General file upload
- `GET /api/files/:filename` - Retrieve uploaded file
- `DELETE /api/files/:filename` - Delete file (authorized users only)

## Payment System (Stripe Integration)

### Payment Flow

1. **Customer Posts Job** → Sets budget/payment amount
2. **Contractor Accepts** → Customer pays via Stripe
3. **Admin Holds Payment** → Money held in escrow
4. **Job Completed** → Customer marks job as complete
5. **Payment Released** → Automatically transferred to contractor
6. **Contractor Withdraws** → Transfers to bank account

### Stripe Features

#### Payment Processing

- Secure card payments via Stripe
- Payment intent creation
- 3D Secure authentication support
- Payment confirmation webhooks

#### Escrow System

- Hold payments in Stripe account
- Automatic release on job completion
- Dispute handling mechanism
- Refund capability for cancelled jobs

#### Contractor Payouts

- Stripe Connect for contractor accounts
- Contractor onboarding (KYC verification)
- Payout scheduling (manual or automatic)
- Withdrawal to bank account
- Earnings dashboard

#### Admin Commission

- Configurable commission percentage
- Automatic commission deduction
- Commission tracking and reporting

### Payment Endpoints

#### Customer Endpoints

- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history

#### Contractor Endpoints

- `POST /api/payouts/connect` - Connect Stripe account
- `GET /api/payouts/balance` - Available balance
- `POST /api/payouts/withdraw` - Request withdrawal
- `GET /api/payouts/history` - Payout history

#### Webhook

- `POST /api/webhooks/stripe` - Handle Stripe events

### Payment States

- `pending` - Payment intent created
- `held` - Payment captured, held in escrow
- `released` - Payment released to contractor
- `withdrawn` - Contractor withdrew funds
- `refunded` - Payment refunded to customer
- `failed` - Payment failed

## Database Models Required

### Chat/Message Model

- sender, receiver, message, timestamp, read status, room ID

### Notification Model

- user, type, title, message, read status, timestamp, metadata

### File Model

- filename, originalName, path, mimeType, size, uploadedBy, uploadDate

### Payment Model

- customer, contractor, job, amount, commission, status, stripePaymentId, timestamps

### Payout Model

- contractor, amount, status, stripePayoutId, requestDate, completedDate

## Environment Variables Required

```env
# WebSocket
SOCKET_PORT=3001

# File Upload
UPLOAD_DIR=./upload
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_COMMISSION_PERCENT=10

# Push Notifications
FCM_SERVER_KEY=...
FCM_PROJECT_ID=...
```

## Dependencies to Add

```json
{
  "stripe": "^14.x",
  "multer": "^1.4.x",
}
```
