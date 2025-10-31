# JobSphere Backend

Backend API for JobSphere - a mobile marketplace connecting customers with local freelance contractors (electricians, plumbers, cleaners, carpenters, etc.).

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Package Manager**: Bun
- **Authentication**: JWT with refresh token rotation
- **Real-Time**: Socket.IO for WebSocket chat
- **Payments**: Stripe with escrow system
- **Notifications**: Firebase Cloud Messaging (FCM)
- **File Upload**: Local storage (future AWS S3 migration)

## Key Features

- JWT authentication with access/refresh tokens
- Role-based access (Customer, Contractor, Admin)
- Real-time chat between users
- Push notifications for mobile app with Firebase
- Stripe payment processing with escrow
- File upload system
- OTP-based password recovery

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- MongoDB instance
- Stripe account (for payments)
- Firebase project (for notifications)

### Installation

```bash
bun install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/jobsphere

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# WebSocket
SOCKET_PORT=3001

# File Upload
UPLOAD_DIR=./upload
MAX_FILE_SIZE=10485760

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_COMMISSION_PERCENT=10

# Firebase (FCM)
FCM_SERVER_KEY=...
FCM_PROJECT_ID=...
```

### Development

```bash
bun dev          # Start with hot reload
bun dev:b        # Start with Bun hot reload
```

### Production

```bash
bun build        # Build the project
bun start        # Start production server
```

### Code Quality

```bash
bun check        # Run oxlint
bun check-types  # TypeScript type checking
```

### Module Generator

Quickly scaffold new API modules with boilerplate code:

```bash
bun run generate:module
```

This will prompt for a module name and create:
- `[module].route.ts` - Express router with CRUD endpoints
- `[module].service.ts` - Business logic handlers
- `[module].schema.ts` - Zod validation schemas with OpenAPI docs

See `script/README.md` for detailed usage.

## Project Structure

```
jobsphere-backend/
├── src/
│   ├── db/              # Database connection and models
│   ├── routers/         # API route handlers
│   │   ├── auth.ts      # Authentication routes
│   │   ├── user.ts      # User management
│   │   ├── job.ts       # Job postings
│   │   ├── payment.ts   # Payment processing
│   │   └── chat.ts      # Chat endpoints
│   ├── middleware/      # Auth, validation, error handling
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── index.ts         # Application entry point
├── upload/              # File upload directory
└── .kiro/steering/      # Project documentation
```

## User Roles

- **Customer**: Posts jobs, hires contractors, makes payments
- **Contractor**: Offers services, accepts jobs, receives payments
- **Admin**: Monitors platform, manages disputes, oversees transactions

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset with OTP
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Payments

- `POST /api/payments/create-intent` - Create payment
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payouts/withdraw` - Contractor withdrawal
- `POST /api/webhooks/stripe` - Stripe webhooks

### File Upload

- `POST /api/upload` - Upload file
- `GET /api/files/:filename` - Get file

## Payment Flow

1. Customer posts job with budget
2. Contractor accepts job
3. Customer pays via Stripe (held in escrow)
4. Job completed → Payment auto-released to contractor
5. Contractor withdraws to bank account

## Contributing

This project uses Husky for pre-commit hooks to ensure code quality. All commits are automatically linted and type-checked.

## License

Private - All rights reserved
