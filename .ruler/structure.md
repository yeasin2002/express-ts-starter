# Project Structure

## Root Directory Layout

```
providus_org/
├── src/                    # Source code
│   ├── db/                 # Database connection and models
│   ├── lib/                # Database connection and models
│   ├── helper/             # Database connection and models
│   ├── middleware/         # Database connection and models
│   ├── schema/             # Database connection and models/
│   ├── api/                # API route handlers
│       ├── user/                # User API route handlers
│           ├── user.route.ts        # Express User API routes. Define all user related routes here. 
│           ├── user.service.ts      # User API route service. Define all user related business logic here in functional way. 
│           ├── user.schema.ts       # User API route validation. Define all user related zod validation schemas for body, query, params etc. 
│           ├── user.openapi.ts      # User API route OpenAPI. Register all user related OpenAPI specs with @asteasolutions/zod-to-openapi. 
│       ├── auth/                # Auth API route handlers
│           ├── auth.route.ts        # Express Auth API routes. Define all auth related routes here. 
│           ├── auth.service.ts      # Auth API route service. Define all auth related business logic here in functional way. 
│           ├── auth.schema.ts       # Auth API route validation. Define all auth related zod validation schemas for body, query, params etc. 
│           ├── auth.openapi.ts      # Auth API route OpenAPI. Register all auth related OpenAPI specs with @asteasolutions/zod-to-openapi. 
│       └── [other modules]/     # Other API modules following same pattern
│
│   └── app.ts            # Application entry point
├── api-client/               # API client code like test-api.http  for each API route
    ├── user-api.http/                # User API client code
    ├── auth-api.http/                # Auth API client code
    ├── [module]-api.http/                # [module] API client code
    
├── .kiro/                  # Kiro AI assistant configuration
├── .husky/                 # Git hooks configuration
├── .ruler/                 # Code quality rules
├── node_modules/           # Dependencies
├── dist/                   # Build output (generated)
└── [config files]         # Various configuration files
```

## Source Code Organization

### `/src/app.ts`

- Main application entry point
- Express app configuration
- CORS setup
- Server initialization and database connection

### `/src/db/`

- Database connection logic (`connectDB` function)
- Mongoose models and schemas (to be added)
- Database utilities and helpers

### `/src/api/**/*` - Module Structure

Each API module follows this pattern:

#### `[module].route.ts`
- Express router with route definitions
- Imports validation middleware
- Imports service handlers
- Exports router instance

#### `[module].service.ts`
- Business logic as RequestHandler functions
- Database operations
- Error handling
- Response formatting

#### `[module].schema.ts`
- Zod validation schemas with OpenAPI extensions
- TypeScript type exports
- Schemas for: create, update, params, responses

#### `[module].openapi.ts`
- Registers schemas with OpenAPI registry
- Registers route paths with full documentation
- Must be imported in `app.ts` to execute registration
- Example: `import "./api/user/user.openapi";`

**Important**: OpenAPI files must be imported in `app.ts` BEFORE calling `generateOpenAPIDocument()` to ensure all routes are registered.

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
