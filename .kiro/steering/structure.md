# Project Structure

## Root Directory Layout

```
providus_org/
├── src/                    # Source code
│   ├── db/                 # Database connection and models
│   │   ├── models/         # Mongoose models
│   │   │   ├── job.model.ts
│   │   │   ├── category.model.ts
│   │   │   ├── location.model.ts
│   │   │   ├── review.model.ts
│   │   │   ├── user.model.ts
│   │   │   ├── job-application-request.model.ts
│   │   │   └── [model].model.ts
│   │   └── index.ts        # Database connection and model exports
│   ├── lib/                # Utility libraries and helpers
│   ├── helpers/            # Helper functions
│   │   ├── response-handler.ts  # Standard API response helpers
│   │   ├── mongodb-error-handler.ts
│   │   └── index.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── index.ts
│   ├── common/             # Common constants and utilities
│   │   ├── email/          # Email templates
│   │   ├── validations/    # Common zod validation schemas
│   │   ├── service/        # Common services that can be used in multiple modules
│   │   └── constants.ts    # Centralized API tags and paths
│   ├── api/                # API route handlers
│   │   ├── auth/           # Authentication module
│   │   │   ├── auth.route.ts
│   │   │   ├── services/   # Service handlers (business logic)
│   │   │   │   ├── index.ts          # Export all services
│   │   │   │   ├── login.service.ts
│   │   │   │   ├── register.service.ts
│   │   │   │   ├── forgot-password.service.ts
│   │   │   │   ├── reset-password.service.ts
│   │   │   │   └── verify-otp.service.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.openapi.ts
│   │   ├── category/       # Category module (uses single service file pattern)
│   │   │   ├── category.route.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.validation.ts
│   │   │   └── category.openapi.ts
│   │   ├── job/            # Job module (uses services folder pattern)
│   │   │   ├── job.route.ts
│   │   │   ├── services/
│   │   │   │   ├── index.ts
│   │   │   │   ├── create-job.service.ts
│   │   │   │   ├── get-all-jobs.service.ts
│   │   │   │   └── [other-services].service.ts
│   │   │   ├── job.validation.ts
│   │   │   └── job.openapi.ts
│   │   ├── job-request/    # Job application request module
│   │   ├── location/       # Location module
│   │   ├── users/          # User management module
│   │   ├── common/         # Common endpoints (e.g., file upload)
│   │   ├── admin/          # Admin module (nested structure)
│   │   │   ├── auth-admin/ # Admin authentication sub-module
│   │   │   │   ├── auth-admin.route.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── login.service.ts
│   │   │   │   ├── auth-admin.validation.ts
│   │   │   │   └── auth-admin.openapi.ts
│   │   │   ├── admin-user/       # Admin user management sub-module
│   │   │   │   ├── admin-user.route.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── get-all-users.service.ts
│   │   │   │   │   ├── get-user.service.ts
│   │   │   │   │   ├── delete-user.service.ts
│   │   │   │   │   └── suspend-user.service.ts
│   │   │   │   ├── user.validation.ts
│   │   │   │   └── user.openapi.ts
│   │   │   ├── dashboard/  # Admin dashboard sub-module
│   │   │   ├── job/        # Admin job management sub-module
│   │   │   ├── payments/   # Admin payments sub-module
│   │   │   └── settings/   # Admin settings sub-module
│   │   └── [other modules]/
│   │
│   └── app.ts              # Application entry point
├── api-client/             # API client code (HTTP test files)
│   ├── user-api.http
│   ├── auth-api.http
│   └── [module]-api.http
├── script/                 # Utility scripts
│   └── generate-module.js  # Module generator script
├── .kiro/                  # Kiro AI assistant configuration
│   └── steering/           # Steering documentation
├── .husky/                 # Git hooks configuration
├── .ruler/                 # Code quality rules
├── node_modules/           # Dependencies
├── dist/                   # Build output (generated)
└── [config files]          # Various configuration files
```

## Source Code Organization

### `/src/app.ts`

- Main application entry point
- Express app configuration
- CORS setup
- Server initialization and database connection

### `/src/db/`

- **`index.ts`**: Database connection logic (`connectDB` function) and model exports
- **`models/`**: Mongoose models and schemas
  - Each model file exports a Mongoose model (e.g., `User`, `Job`, `Category`)
  - Models are imported and exported through `db` object in `index.ts`
  - Example: `export const db = { user: User, job: Job, category: Category }`

### `/src/common/` - Shared Resources

#### `constants.ts` - Centralized Configuration

Contains centralized constants for the entire application:

- **openAPITags**: Defines all API paths and OpenAPI tags
  - Prevents hardcoded paths throughout the codebase
  - Single source of truth for API documentation
  - Easy to refactor and maintain
  - Supports nested structures for complex modules
  - Example: `openAPITags.authentication.basepath` → `"/api/auth"`
  - Example nested: `openAPITags.admin.user_management.basepath` → `"/api/admin/users"`
- **mediaTypeFormat**: Common media type constants
  - `json`: "application/json"
  - `form`: "multipart/form-data"

#### `email/` - Email Templates

- Reusable email templates using nodemailer
- Examples: `otp-email.ts`, `welcome-email.ts`

#### `validations/` - Common Validation Schemas

- Shared Zod validation schemas used across multiple modules
- Examples: `mongodb-id.validation.ts`, `param.validation.ts`, `response.validation.ts`
- Reduces duplication and ensures consistency

#### `service/` - Common Services

- Shared business logic that can be used across multiple modules
- Example: `get-users.service.ts` for fetching user data from different contexts

### `/src/api/**/*` - Module Structure

Each API module follows this pattern:

#### `[module].route.ts`

- Express router with route definitions
- Imports validation middleware
- Imports service handlers
- Exports router instance with descriptive name
- Example: `export const auth: Router = express.Router();`
- For nested modules: `export const adminUser: Router = express.Router();`

#### `services/` folder

- Contains individual service handler files
- Each file handles specific business logic (e.g., `login.service.ts`, `register.service.ts`)
- Keeps code organized and maintainable
- **`index.ts`**: Barrel export file that exports all services
- **`[action].service.ts`**: Individual service handlers as RequestHandler functions

**Benefits of services folder:**

- Better code organization for large modules
- Easier to locate specific functionality
- Reduces file size and complexity
- Improves maintainability and testability
- Clear separation of concerns

**Example structure:**

```
auth/
├── services/
│   ├── index.ts                    # export * from "./login.service"
│   ├── login.service.ts            # export const login: RequestHandler
│   ├── register.service.ts         # export const register: RequestHandler
│   ├── forgot-password.service.ts  # export const forgotPassword: RequestHandler
│   └── reset-password.service.ts   # export const resetPassword: RequestHandler
```

#### `[module].validation.ts`

- Zod validation schemas with OpenAPI extensions
- TypeScript type exports
- Schemas for: create, update, params, responses

#### `[module].openapi.ts`

- Registers schemas with OpenAPI registry
- Registers route paths with full documentation
- Uses centralized constants from `@/common/constants`
- Must be imported at the top of the corresponding `.route.ts` file
- Example: `import "./user.openapi";`

**Important**: OpenAPI files are imported in route files, which are then imported in `app.ts` BEFORE calling `generateOpenAPIDocument()` to ensure all routes are registered.

### Nested Module Pattern

For complex features like admin panel, use nested modules:

```
src/api/admin/
├── user/           # Sub-module for user management
│   ├── user.route.ts
│   ├── services/
│   │   ├── index.ts
│   │   ├── get-all-users.service.ts
│   │   ├── get-user.service.ts
│   │   ├── delete-user.service.ts
│   │   └── suspend-user.service.ts
│   ├── user.validation.ts
│   └── user.openapi.ts
├── dashboard/      # Sub-module for dashboard
└── settings/       # Sub-module for settings
```

**Registration in app.ts:**

```typescript
import { adminUser } from "@/api/admin/user/user.route";
app.use("/api/admin/users", adminUser);
```

**Export naming convention for nested modules:**

- Use descriptive names that indicate the parent module
- Example: `adminUser`, `adminDashboard`, `adminSettings`
- This prevents naming conflicts with top-level modules

### `/src/helpers/` - Response and Error Handlers

Contains utility functions for consistent API responses:

#### `response-handler.ts`

- **Standard Response Format**: All API responses follow this structure:

  ```typescript
  {
    status: number,
    message: string,
    data: any | null,
    success: boolean,
    errors?: Array<{ path: string; message: string }>
  }
  ```

- **Helper Functions**:

  - `sendSuccess(res, statusCode, message, data)` - Success responses
  - `sendError(res, statusCode, message, errors?)` - Error responses
  - `sendCreated(res, message, data)` - 201 Created
  - `sendBadRequest(res, message, errors?)` - 400 Bad Request
  - `sendUnauthorized(res, message)` - 401 Unauthorized
  - `sendForbidden(res, message)` - 403 Forbidden
  - `sendNotFound(res, message)` - 404 Not Found
  - `sendInternalError(res, message)` - 500 Internal Server Error

- **ResponseHandler Class**: Chainable response handler for cleaner code

#### `mongodb-error-handler.ts`

- Handles MongoDB-specific errors (duplicate keys, validation errors, etc.)
- Converts MongoDB errors to user-friendly messages

### `/src/middleware/` - Express Middleware

#### `auth.middleware.ts`

- **`requireAuth`**: Verifies JWT access token, adds user to `req.user`
- **`requireRole(role)`**: Checks if user has specific role (customer, contractor, admin)
- **`requireAnyRole(roles[])`**: Checks if user has any of the specified roles
- **`requireOwnership(userIdParam)`**: Ensures user can only access their own resources
- **`optionalAuth`**: Adds user data if token present, but doesn't require it

#### `validation.middleware.ts`

- **`validateBody(schema)`**: Validates request body against Zod schema
- **`validateParams(schema)`**: Validates route parameters
- **`validateQuery(schema)`**: Validates query parameters

#### `error.middleware.ts`

- **`notFoundHandler`**: Handles 404 errors for undefined routes
- **`errorHandler`**: Global error handler for uncaught errors

## Configuration Files

### Core Config

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration with path aliases
- `tsdown.config.ts` - Build tool configuration

### Code Quality

- `.oxlintrc.json` - Linting rules (comprehensive oxlint setup)
- `.husky/pre-commit` - Git pre-commit hooks
- `lint-staged` configuration in package.json

### Environment

- `.env` - Environment variables (not tracked)
- `.env.example` - Environment template

## Architectural Patterns

### Module Organization

- Separate concerns: database, routing, main app
- Use path aliases (`@/`) for clean imports
- Export typed router interfaces for type safety

### File Naming

- Use kebab-case for directories when needed
- Use camelCase for TypeScript files
- Index files for clean module exports

### Import/Export Style

- ES modules throughout
- Named exports preferred
- Barrel exports from index files
