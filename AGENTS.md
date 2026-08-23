# Node Express Starter — Agent Steering Guide

This steering guide provides the definitive context, architecture specifications, and technical standards for working on this **Express 5 + TypeScript + PostgreSQL (Drizzle ORM)** REST API starter template.

The guide is organized into three core sections:
1. **[Product](#1-product)** — High-level purpose, centralized naming/branding, architecture goals, and core product capabilities.
2. **[Structure](#2-structure)** — Complete file tree, module pattern, scaffolding workflow, database patterns, Docker Compose services, and middleware pipeline.
3. **[Tech](#3-tech)** — Tech stack specifications, TypeScript rules, Drizzle ORM helpers, API references, scripts, linting/formatting, and environment configuration.

---

## 1. Product

### Overview & Mission
This repository is a production-ready, highly structured **Express 5 + TypeScript + PostgreSQL REST API starter template** built with **Node.js, Express.js, Drizzle ORM, and modern TypeScript tooling**. It is engineered to serve as a solid, scalable boilerplate for RESTful web services and backend APIs, providing a standardized developer framework where every domain module follows an identical, predictable pattern.

### Centralized Application Name & Metadata
The application identity, name, and metadata are centralized in `src/common/constants.ts` under `APP_CONFIG`. Changing the configuration values in this single location automatically updates the metadata across the entire codebase (including OpenAPI documentation, API headers, and server logs):

```typescript
export const APP_CONFIG = {
	name: "node-express-starter",
	displayName: "Node Express Starter",
	title: "Node Express Starter API",
	description:
		"Production-ready REST API starter template built with Node.js, Express 5, TypeScript, and Drizzle ORM",
	version: "1.0.0",
} as const;
```

### Key Capabilities & Core Features
- **Modular Domain Architecture**: Domain resources are completely self-contained within dedicated module directories under `src/api/`, separating routes, schemas, OpenAPI contracts, and isolated service handlers.
- **Relational Data Modeling with Drizzle ORM**: Type-safe PostgreSQL table schemas (`src/db/schema/`) using **Drizzle ORM** with **node-postgres (`pg`)** connection pooling and **drizzle-kit** migration tooling.
- **Containerized Development Environment**: Multi-service **Docker Compose** configuration orchestrating **PostgreSQL 16**, **Redis 7**, and **MinIO (S3 compatible object storage)**.
- **Automated CLI Module Generator**: Built-in scaffolding script (`script/generate-module.js` / `pnpm generate:module`) to generate standardized top-level or nested sub-modules with zero manual boilerplate.
- **End-to-End Type Safety & Schema Validation**: Runtime request validation powered by **Zod** and **drizzle-zod**, seamlessly coupled with **@asteasolutions/zod-to-openapi** for automatic TypeScript type inference and OpenAPI 3.0 specification generation.
- **Dual Interactive API Documentation**: Integrated live interactive documentation with **Scalar UI** (`/scaler`) and **Swagger UI** (`/swagger`), along with the raw JSON OpenAPI schema (`/api-docs.json`).
- **Robust Authentication & RBAC**: JWT Access (15-day) and Refresh Tokens (30-day with cryptographic `jti`), Bcrypt password hashing, 4-digit OTP generation, and composable authorization middlewares for role checks and resource ownership verification.
- **Standardized Response Envelope**: Uniform HTTP responses across all endpoints adhering to the `ApiResponse<T>` contract (`status`, `message`, `data`, `success`, `errors`).
- **Centralized PostgreSQL Error Translation**: Automatic parsing of PostgreSQL database error codes (`23505` unique violation, `23503` foreign key violation, `23502` not null violation, `22P02` invalid format/UUID) into clean, client-friendly HTTP 400 bad request responses via `dbErrorHandler`.
- **Enterprise Structured Logging**: Daily rotating multi-file logging using **Winston** (`error`, `combined`, `http` logs with automated retention policies), uncaught exception safety handlers, and custom colorized **Morgan** HTTP request logging with client IP tracking.
- **Multipart File Upload Handling**: **Multer** disk storage for image uploads (JPEG, PNG, GIF, WebP, SVG) with a 5MB limit, unique timestamp naming, and static file serving from `/uploads`.
- **Transactional Email Transport**: **Nodemailer** transporter pre-configured for SMTP/Gmail integration.

---

## 2. Structure

### Project File Tree

```
express-ts-starter/
├── .github/
│   ├── dependabot.yml                     # Dependabot package updates config
│   └── workflows/
│       └── build.yml                      # CI build and lint workflow
├── .husky/                                # Git commit hooks
├── api-client/
│   └── test-api.http                      # VS Code REST Client test request collection
├── doc/
│   ├── module-generator.md                # Comprehensive documentation for the module generator
│   └── openapi-pattern.md                 # Detailed OpenAPI registration & schema guidelines
├── drizzle/                               # Drizzle migrations output directory
├── script/
│   └── generate-module.js                 # Interactive & flag-driven module scaffolding CLI
├── src/
│   ├── app.ts                             # Express application bootstrap & route assembly
│   ├── api/                               # Domain API modules
│   │   └── example/                       # Canonical reference module
│   │       ├── example.route.ts           # Express Router & side-effect OpenAPI import
│   │       ├── example.validation.ts      # Zod validation schemas & inferred types
│   │       ├── example.openapi.ts         # OpenAPI path & schema definitions
│   │       └── services/
│   │           ├── index.ts               # Barrel export for service handlers
│   │           └── example.service.ts     # Individual action RequestHandler
│   ├── common/
│   │   ├── index.ts                       # Barrel export for common constants
│   │   └── constants.ts                   # APP_CONFIG, openAPITags, and mediaTypeFormat
│   ├── data/
│   │   └── index.ts                       # Static seed or lookup data
│   ├── db/
│   │   ├── index.ts                       # Drizzle ORM client, pool, and schema exports
│   │   └── schema/                        # PostgreSQL table definitions
│   │       ├── index.ts                   # Schema barrel export
│   │       └── example.schema.ts          # Example table & drizzle-zod schemas
│   ├── helpers/
│   │   ├── index.ts                       # Barrel export for helpers
│   │   ├── response-handler.ts            # Standard API response wrappers & ResponseHandler class
│   │   └── db-error-handler.ts            # PostgreSQL & Drizzle exception mapper & UUID validator
│   ├── lib/
│   │   ├── index.ts                       # Barrel export for lib utilities
│   │   ├── connect-db.ts                  # PostgreSQL connection test initializer
│   │   ├── get-my-ip.ts                   # Local network IPv4 address resolver
│   │   ├── jwt.ts                         # JWT sign/verify, bcrypt hash/compare, OTP generator
│   │   ├── logger.ts                      # Winston logger with daily rotating file transports
│   │   ├── morgan.ts                      # Custom colorized Morgan format
│   │   ├── multer.ts                      # Multer disk upload config & file management helpers
│   │   ├── nodemailer.ts                  # Gmail SMTP transporter
│   │   └── openapi.ts                     # OpenAPIRegistry singleton & doc generator
│   └── middleware/
│       ├── index.ts                       # Barrel export for middleware
│       ├── auth.middleware.ts             # requireAuth, requireRole, requireAnyRole, requireOwnership, optionalAuth
│       ├── validation.middleware.ts       # validateBody, validateParams, validateQuery, validate
│       └── common/
│           ├── default-not-found.ts       # 404 Not Found route handler
│           ├── global-error-handler.ts    # Unhandled error & exception middleware
│           └── index.ts                   # Barrel export for common middleware
├── uploads/                               # Static directory for uploaded files (served at /uploads)
├── .env.example                           # Example environment variable template
├── .gitignore                             # Git ignore definitions
├── .oxlintrc.json                         # Oxlint semantic linting rules
├── biome.json                             # Biome formatter & linter configuration
├── docker-compose.yml                     # PostgreSQL, Redis, and MinIO container configuration
├── drizzle.config.ts                      # Drizzle Kit migration configuration
├── globals.d.ts                           # Global TypeScript declarations & Request extensions
├── package.json                           # Scripts and dependency declarations
├── pnpm-lock.yaml                         # Deterministic pnpm lockfile
├── pnpm-workspace.yaml                    # Workspace config (pnpm settings)
├── tsconfig.json                          # TypeScript compiler configuration
└── tsdown.config.ts                       # tsdown production build configuration
```

---

### Docker Compose Services

The `docker-compose.yml` provides a localized infrastructure for development:

| Service | Container Name | Internal Port | Host Port | Credentials / Defaults |
|---|---|---|---|---|
| **PostgreSQL 16** | `node-express-postgres` | `5432` | `5432` | DB: `node_express_db`, User: `postgres`, Pass: `postgres` |
| **Redis 7** | `node-express-redis` | `6379` | `6379` | No auth by default |
| **MinIO (S3)** | `node-express-minio` | `9000` (API), `9001` (Console) | `9000`, `9001` | User: `minioadmin`, Pass: `minioadminpassword` |

To spin up local infrastructure:
```bash
docker compose up -d
```

---

### API Module 4-File Pattern

Every API resource follows a strict 4-part structure within `src/api/[module]/`:

```
src/api/[module]/
├── [module].route.ts          # 1. Express Router & route registrations
├── [module].validation.ts     # 2. Zod schemas & TypeScript type exports
├── [module].openapi.ts        # 3. OpenAPI registry definitions & path registrations
└── services/                  # 4. Business logic handlers
    ├── index.ts               # Barrel export of all service handlers
    └── [action].service.ts    # Single action RequestHandler per file
```

#### 1. `[module].route.ts`
- **Mandatory**: Imports its own `.openapi.ts` as a **side-effect import** at the top of the file to guarantee OpenAPI path registration.
- Exports a named camelCase router (e.g., `export const user: Router = express.Router();`).
- Chains validation middleware (`validateBody`, `validateParams`, `validateQuery`, `validate`) and auth middleware (`requireAuth`, `requireRole`, etc.) before service handlers.

```typescript
import "./user.openapi";
import express, { type Router } from "express";
import { requireAuth, validateBody, validateParams } from "@/middleware";
import { createUser, getUserById, getAllUsers } from "./services";
import { CreateUserSchema, UserIdSchema } from "./user.validation";

export const user: Router = express.Router();

user.get("/", getAllUsers);
user.get("/:id", validateParams(UserIdSchema), getUserById);
user.post("/", requireAuth, validateBody(CreateUserSchema), createUser);
```

#### 2. `[module].validation.ts`
- Always calls `extendZodWithOpenApi(z)` at the top of the file.
- Defines a base schema (or uses `drizzle-zod`), then derives create/update/param/response schemas.
- Uses `.openapi("SchemaName")` to attach metadata for Swagger/Scalar documentation.
- Exports inferred TypeScript types via `z.infer<typeof Schema>`.

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  id: z.string().uuid().openapi({ description: "User unique ID", example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }),
  name: z.string().min(1, "Name is required").openapi({ description: "Full name", example: "John Doe" }),
  email: z.string().email("Invalid email").openapi({ description: "Email address", example: "john@example.com" }),
  role: z.enum(["customer", "contractor", "admin"]).openapi({ description: "User role" }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).openapi("User");

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true }).openapi("CreateUser");
export const UpdateUserSchema = UserSchema.partial().openapi("UpdateUser");
export const UserIdSchema = z.object({ id: z.string().uuid() }).openapi("UserIdParam");

export const UserResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: UserSchema.nullable(),
  success: z.boolean(),
}).openapi("UserResponse");

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
```

#### 3. `[module].openapi.ts`
- Imports `registry` from `@/lib/openapi` and `openAPITags`, `mediaTypeFormat` from `@/common/constants`.
- Registers named schemas via `registry.register()`.
- Registers endpoint documentation via `registry.registerPath()` for each method and path.
- Always documents appropriate HTTP response codes (`200`/`201`, `400`, `401`/`403`, `404`, `500`).
- Adds `security: [{ bearerAuth: [] }]` for protected endpoints.

```typescript
import { registry } from "@/lib/openapi";
import { openAPITags, mediaTypeFormat } from "@/common/constants";
import { CreateUserSchema, UserResponseSchema } from "./user.validation";

registry.register("CreateUser", CreateUserSchema);
registry.register("UserResponse", UserResponseSchema);

registry.registerPath({
  method: "post",
  path: "/api/user",
  summary: "Create a new user",
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        [mediaTypeFormat.json]: { schema: CreateUserSchema },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: { [mediaTypeFormat.json]: { schema: UserResponseSchema } },
    },
    400: { description: "Validation error" },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});
```

#### 4. `services/[action].service.ts`
- Each service file exports a single, dedicated `RequestHandler`.
- **Never call `res.json()` directly** — always return response helpers (`sendSuccess`, `sendCreated`, `sendBadRequest`, etc.) from `@/helpers`.
- Wraps database operations in `try / catch` blocks and uses `dbErrorHandler(error, res, defaultMessage)` from `@/helpers`.

```typescript
import type { RequestHandler } from "express";
import { sendCreated, dbErrorHandler } from "@/helpers";
import { db, users } from "@/db";

export const createUser: RequestHandler = async (req, res) => {
  try {
    const [newUser] = await db.insert(users).values(req.body).returning();
    return sendCreated(res, "User created successfully", newUser);
  } catch (error) {
    return dbErrorHandler(error, res, "Failed to create user");
  }
};
```

---

### Module Generator CLI

The codebase includes an automated generator at `script/generate-module.js` that creates the complete 4-file structure.

#### Usage
```bash
# Interactive mode (prompts for module name)
pnpm generate:module

# Direct top-level module generation
pnpm generate:module --module user

# Nested sub-module generation (e.g. src/api/admin/user/)
pnpm generate:module --sub admin --module user
```

#### 5-Step Post-Generation Lifecycle
After generating a new module:
1. **Define Schemas**: Flesh out fields in `[module].validation.ts`.
2. **Create Table Schema**: Create table in `src/db/schema/[module].schema.ts`.
3. **Register Table in Schema Index**: Add schema export to `src/db/schema/index.ts` and run `pnpm db:push` or `pnpm db:generate`.
4. **Implement Business Logic**: Create granular handlers in `services/` using Drizzle ORM and export in `services/index.ts`.
5. **Mount Router in `src/app.ts`**: Import and mount the router before `notFoundHandler`:
   ```typescript
   import { user } from "@/api/user/user.route";
   // ...
   app.use("/api/user", user);
   ```

---

### Database Architecture & Drizzle ORM

Database schema and connection pooling are centralized under `src/db/`:

1. **Table Schema (`src/db/schema/[model].schema.ts`)**:
   ```typescript
   import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
   import { createInsertSchema, createSelectSchema } from "drizzle-zod";

   export const users = pgTable("users", {
     id: uuid("id").primaryKey().defaultRandom(),
     name: text("name").notNull(),
     email: text("email").notNull().unique(),
     role: text("role").default("customer").notNull(),
     createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
     updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
   });

   export const insertUserSchema = createInsertSchema(users);
   export const selectUserSchema = createSelectSchema(users);
   ```

2. **Schema Registry (`src/db/schema/index.ts`)**:
   ```typescript
   export * from "./example.schema";
   export * from "./user.schema";
   ```

3. **Drizzle Client (`src/db/index.ts`)**:
   ```typescript
   import { drizzle } from "drizzle-orm/node-postgres";
   import { Pool } from "pg";
   import * as schema from "./schema";

   export const pool = new Pool({
     connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/node_express_db",
   });

   export const db = drizzle(pool, { schema });
   export * from "./schema";
   ```

---

### Middleware Pipeline & Request Flow

The Express application in `src/app.ts` executes middleware in the following strict order:

```mermaid
flowchart TD
    Req[Incoming HTTP Request] --> BodyParsers[express.json & express.urlencoded]
    BodyParsers --> StaticUploads[Static Uploads /uploads]
    StaticUploads --> MorganLogger[Morgan HTTP Logger]
    MorganLogger --> CORS[CORS Middleware]
    CORS --> HealthCheck[Health Check GET /]
    HealthCheck --> OpenApiDocs[OpenAPI UIs /swagger, /scaler, /api-docs.json]
    OpenApiDocs --> RouteMiddleware[Route Specific Middleware: Auth & Validation]
    RouteMiddleware --> ServiceHandler[Service RequestHandler]
    ServiceHandler --> SuccessResp[Success Response Envelope]
    RouteMiddleware -.->|Invalid Route| NotFound[notFoundHandler 404]
    ServiceHandler -.->|Exception| GlobalError[errorHandler 500]
```

---

## 3. Tech

### Tech Stack Matrix

| Category | Technology / Package | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js (with `tsx`) / Bun | Node >= 20 / Bun | Modern TypeScript execution and hot reload |
| **Framework** | `express` | `^5.1.0` | Next-generation Express 5 with native async support |
| **Database & ORM** | `pg`<br>`drizzle-orm`<br>`drizzle-kit` | `^8.13.3`<br>`^0.39.3`<br>`^0.30.4` | PostgreSQL driver, type-safe SQL ORM, and migration CLI |
| **Validation** | `zod`<br>`drizzle-zod` | `^4.1.12`<br>`^0.7.0` | Schema validation and table-to-Zod schema generation |
| **OpenAPI** | `@asteasolutions/zod-to-openapi` | `^8.1.0` | Zod schema transformation to OpenAPI 3.0 |
| **API Docs UI** | `@scalar/express-api-reference`<br>`swagger-ui-express`<br>`openapi3-ts` | `^0.8.22`<br>`^5.0.1`<br>`^4.5.0` | Dual interactive documentation interfaces (Scalar & Swagger) |
| **Authentication** | `jsonwebtoken`<br>`bcryptjs` | `^9.0.2`<br>`^3.0.2` | JWT access/refresh token lifecycle and password hashing |
| **File Uploads** | `multer` | `^2.0.2` | Multipart form-data processing with MIME filters |
| **Email** | `nodemailer` | `^7.0.10` | SMTP email transport |
| **Logging** | `winston`<br>`winston-daily-rotate-file`<br>`morgan`<br>`chalk` | `^3.18.3`<br>`^5.0.0`<br>`^1.10.1`<br>`^5.6.2` | Structured multi-file rotation logging & colorized HTTP logs |
| **Build** | `tsdown` | `^0.15.9` | High-speed esbuild-based bundler with DTS generation |
| **Linting & Formatting** | `@biomejs/biome`<br>`oxlint`<br>`husky`<br>`lint-staged` | `2.2.6`<br>`^1.24.0`<br>`^9.1.7`<br>`^16.2.6` | Fast formatting, semantic linting, and git hooks |
| **Configuration** | `dotenv` | `^17.2.3` | Environment variable management |

---

### Package Management & Scripts

> [!CAUTION]
> **Strict Package Manager Rule**: Always use **`pnpm`** (`pnpm@10.18.3`). Never use `npm` or `yarn`.

| Script | Command | Purpose |
|---|---|---|
| `pnpm dev` | `tsx watch src/app.ts` | Local development server with file watching |
| `pnpm dev:b` | `bun --hot src/app.ts` | Development server powered by Bun |
| `pnpm build` | `tsdown` | Production bundle & TypeScript declaration build |
| `pnpm start` | `node dist/app.js` | Run compiled production bundle |
| `pnpm compile` | `bun build --compile ...` | Compile standalone binary server executable via Bun |
| `pnpm docker:up` | `docker compose up -d` | Start containers in background using Docker |
| `pnpm docker:down` | `docker compose down` | Stop and remove Docker containers |
| `pnpm docker:logs` | `docker compose logs -f` | Follow live Docker container logs |
| `pnpm docker:restart` | `docker compose restart` | Restart Docker container services |
| `pnpm podman:up` | `podman compose up -d` | Start containers in background using Podman |
| `pnpm podman:down` | `podman compose down` | Stop and remove Podman containers |
| `pnpm podman:logs` | `podman compose logs -f` | Follow live Podman container logs |
| `pnpm podman:restart` | `podman compose restart` | Restart Podman container services |
| `pnpm check-types` | `tsc -b` | TypeScript project type-check without emit |
| `pnpm check` | `oxlint` | Fast semantic TypeScript lint check |
| `pnpm format` | `biome format --write ./src` | Code formatting with Biome |
| `pnpm db:generate` | `drizzle-kit generate` | Generate SQL migration files from Drizzle schema |
| `pnpm db:migrate` | `drizzle-kit migrate` | Apply pending SQL migrations to PostgreSQL |
| `pnpm db:push` | `drizzle-kit push` | Push schema directly to database (prototyping) |
| `pnpm db:studio` | `drizzle-kit studio` | Launch interactive Drizzle Studio database browser |
| `pnpm db:drop` | `drizzle-kit drop` | Drop migrations |
| `pnpm generate:module` | `node script/generate-module.js` | Scaffold a new API domain module |

---

### TypeScript Configuration & Standards

- **Path Alias**: `@/*` maps directly to `./src/*` across all source files. Always use `@/` for internal imports.
- **Verbatim Module Syntax**: `verbatimModuleSyntax: true` is enforced. All type-only imports **must** use `import type`:
  ```typescript
  import type { Request, Response, NextFunction, RequestHandler } from "express";
  ```
- **Strict Mode**: Full TypeScript strict mode enabled (`strict: true`, `target: ESNext`, `moduleResolution: bundler`).

---

### Core Helper & Utility Reference

#### 1. Response Helpers (`@/helpers/response-handler.ts`)
Standard response format across all endpoints:
```json
{
  "status": 200,
  "message": "Resource fetched successfully",
  "data": { ... },
  "success": true
}
```

| Helper Function | HTTP Status | Description |
|---|---|---|
| `sendSuccess(res, status?, message, data?)` | 200 (or custom 2xx) | Standard successful data response |
| `sendCreated(res, message, data)` | 201 | New resource creation response |
| `sendNoContent(res)` | 204 | Successful deletion with no body |
| `sendBadRequest(res, message?, errors?)` | 400 | Validation error or bad user input |
| `sendUnauthorized(res, message?)` | 401 | Missing, expired, or invalid JWT |
| `sendForbidden(res, message?)` | 403 | Authenticated user lacks required role/permission |
| `sendNotFound(res, message?)` | 404 | Resource not found |
| `sendInternalError(res, message?)` | 500 | Unhandled server error (logs to Winston) |
| `createResponseHandler(res)` | Chainable class | Instance of `ResponseHandler` for method chaining |

#### 2. PostgreSQL & Drizzle Error Handler (`@/helpers/db-error-handler.ts`)
- **`dbErrorHandler(error, res, defaultMessage)`**: Catches PostgreSQL errors and returns appropriate HTTP responses:
  - `23505` (unique_violation) &rarr; 400 (`"Duplicate entry for <field>"`)
  - `23503` (foreign_key_violation) &rarr; 400 (`"Foreign key violation: The referenced entity does not exist"`)
  - `23502` (not_null_violation) &rarr; 400 (`"Missing required field: <column>"`)
  - `22P02` (invalid_text_representation) &rarr; 400 (`"Invalid input format provided"`)
  - `22001` (string_data_right_truncation) &rarr; 400 (`"Input value exceeds the maximum allowed length"`)
  - Other errors &rarr; 500 internal server error
- **`isValidUUID(id: string)`**: Utility verifying UUID string syntax.

#### 3. Authentication & RBAC Middleware (`@/middleware/auth.middleware.ts`)
- **`requireAuth`**: Validates `Authorization: Bearer <token>`, decodes payload, and populates `req.user`.
- **`requireRole("admin")`**: Ensures `req.user.role` matches the specified role.
- **`requireAnyRole(["customer", "admin"])`**: Checks if `req.user.role` is included in the allowed roles array.
- **`requireOwnership("id")`**: Verifies that `req.user.userId === req.params[id]` (admins automatically bypass).
- **`optionalAuth`**: Populates `req.user` if a valid token exists, without throwing errors if omitted.

#### 4. Validation Middleware (`@/middleware/validation.middleware.ts`)
- **`validateBody(Schema)`**: Parses `req.body` and attaches typed output.
- **`validateParams(Schema)`**: Parses route parameters (`req.params`).
- **`validateQuery(Schema)`**: Validates query parameters (`req.query`).
- **`validate({ body?, params?, query? })`**: Combined multi-target validation.

#### 5. JWT & Cryptography Utilities (`@/lib/jwt.ts`)
- `signAccessToken(payload)`: Generates 15-day access token.
- `signRefreshToken(payload)`: Generates 30-day refresh token with a cryptographic 16-byte hex `jti`.
- `verifyAccessToken(token)` / `verifyRefreshToken(token)`: Validates and returns decoded token payload.
- `hashPassword(password)` / `comparePassword(password, hash)`: Bcrypt hashing (10 salt rounds).
- `generateOTP()`: Generates 4-digit numeric string OTP.

#### 6. Structured Logging (`@/lib/logger.ts`)
- Winston instance logging to console (colorized in dev) and daily-rotating files under `logs/`:
  - `logs/error-YYYY-MM-DD.log` (14-day retention, 20MB max)
  - `logs/combined-YYYY-MM-DD.log` (14-day retention, 20MB max)
  - `logs/http-YYYY-MM-DD.log` (7-day retention, 20MB max)

---

### Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/node_express_db` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `MINIO_ENDPOINT` | MinIO / S3 storage host | `localhost` |
| `MINIO_PORT` | MinIO API port | `9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadminpassword` |
| `PORT` | HTTP server listening port | `4000` |
| `API_BASE_URL` | Base API URL used in OpenAPI configuration | `http://localhost:4000` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `ACCESS_SECRET` | JWT Access Token secret key | Secret string (must set in production) |
| `REFRESH_SECRET` | JWT Refresh Token secret key | Secret string (must set in production) |
| `LOG_LEVEL` | Winston logger threshold level | `info` |
| `SMTP_USER` | Gmail / SMTP email address | `example@gmail.com` |
| `SMTP_PASS` | Gmail app password / SMTP credentials | `xxxx xxxx xxxx xxxx` |

---

### CI/CD Workflow Standards

When maintaining the GitHub Actions workflow (`.github/workflows/build.yml`):
- Setup `pnpm` before Node.js using `pnpm/action-setup@v3`.
- Install dependencies using `pnpm install --frozen-lockfile`.
- Run type checks with `pnpm check-types`.
- Run linting with `pnpm check`.
- Build production assets with `pnpm build`.
