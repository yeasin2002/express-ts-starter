# Product Overview

**JobSphere** is a mobile marketplace backend that connects customers with local freelance contractors (electricians, plumbers, cleaners, carpenters, etc.). Built with the Better-T-Stack (BTS) framework, this TypeScript-first Express.js application provides RESTful API endpoints with MongoDB database integration.

## User Roles

### 1. Customer (Buyer)

- Normal users who hire contractors for services
- Can post job requests, search contractors, make bookings
- Manage payments, reviews, and communicate with contractors

### 2. Contractor (Seller)

- Service providers offering their skills
- Manage profiles, portfolios, pricing, and availability
- Accept/decline jobs, track earnings, communicate with customers

### 3. Admin

- Dashboard access to monitor all system activities
- access to customer and contractor data and have power to modify, accept or reject. 
- Manage disputes, verify contractors, oversee transactions

## Key Features

- **Authentication System**: JWT-based with access and refresh token rotation
  - User registration (Customer & Contractor)
  - Login with email/password
  - Forgot password with OTP via email
  - Secure token refresh mechanism

- **Real-Time Chat**: WebSocket-based messaging system
  - One-to-one chat between customers and contractors
  - Message history and read receipts
  - File sharing in conversations
  - No voice/video call support

- **Push Notifications**: Mobile notifications for Flutter app
  - Job updates, booking confirmations
  - New messages and payment notifications
  - Firebase push notifications

- **File Upload System**: Local storage with cloud migration planned
  - Profile and portfolio images
  - Job-related documents
  - Chat attachments
  - Currently stored in `/upload` folder
  - Future migration to AWS S3 or similar

- **Payment System**: Stripe integration with escrow
  - Secure payment processing
  - Admin holds payment until job completion
  - Automatic release to contractor
  - Contractor withdrawal system
  - Configurable admin commission
  - Stripe Connect for contractor payouts

- RESTful API server with Express.js
- MongoDB database with Mongoose ODM
- Type-safe development with TypeScript
- CORS-enabled for cross-origin requests
- Environment-based configuration
- Git hooks for code quality enforcement

## Architecture

The application follows a modular Express.js architecture with separate concerns for database connectivity, routing, authentication, real-time communication, and main application logic. It's designed as a standalone backend service serving Flutter mobile apps and React.js admin dashboard.

### Technology Integration
- **Mobile App**: Flutter (separate repository)
- **Admin Dashboard**: React.js
- **Real-Time**: Socket.IO for WebSocket connections
- **Payments**: Stripe API with Connect for payouts
- **Notifications**: Firebase Cloud Messaging (FCM)
- **File Storage**: Local filesystem (migration to cloud planned)
