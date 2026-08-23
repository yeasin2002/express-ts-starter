# Express TypeScript Starter — Project Steering Guide

## Project Overview

This is a production-ready **Express 5 + TypeScript REST API starter** for a backend service called **JobSphere**. It ships a reference module (`src/api/example/`) that developers copy and customize for every new feature. The codebase integrates MongoDB via Mongoose, JWT auth, Zod validation, OpenAPI documentation, structured logging, file uploads, and a module scaffolding CLI.

**Package manager:** `pnpm@10.18.3` — always use `pnpm`, never `npm` or `yarn`.

---

## Tech Stack

| Layer | Package | Version |
|---|---|---|
| Runtime | Node.js with `tsx` | — |
| Framework | `express` | ^5.1.0 (Express 5, not 4) |
| Database | `mongoose` + `mongodb` | ^8.19.2 / ^6.20.0 |
| Validation | `zod` | ^4.1.12 |
| OpenAPI | `@asteasolutions/zod-to-openapi` | ^8.1.0 |
| Auth | `jsonwebtoken` + `bcryptjs` | ^9.0.2 / ^3.0.2 |
| File uploads | `multer` | ^2.0.2 |
| Email | `nodemailer` | ^7.0.10 |
| Logging | `winston` + `winston-daily-rotate-file` | ^3.18.3 |
| Build | `tsdown` | ^0.15.9 |
| Formatter | `@biomejs/biome` | 2.2.6 |
| Linter | `oxlint` | ^1.24.0 |

---

## Project Structure

```
src/
├── app.ts                         # Express entry point — bootstrap, middleware, routes
├── api/
│   └── [module]/                  # One folder per API domain
│       ├── [module].route.ts      # Express Router + side-effect OpenAPI import
│       ├── [module].validation.ts # Zod schemas + TypeScript types
│       ├── [module].openapi.ts    # OpenAPI path/schema registration
│       └── services/
│           ├── index.ts           # Barrel re-export of all service handlers
│           └── [action].service.ts
├── common/
│   └── constants.ts               # openAPITags + mediaTypeFormat (create when adding first module)
├── db/
│   ├── index.ts                   # db object — maps keys to Mongoose models
│   └── models/                    # Mongoose model files
├── helpers/
│   ├── index.ts                   # Barrel export
│   ├── response-handler.ts        # All HTTP response helper functions
│   └── mongodb-error-handler.ts   # Mongoose error → HTTP response mapping
├── lib/
│   ├── index.ts                   # Barrel export for all lib utilities
│   ├── connect-mongo.ts           # mongoose.connect with global plugin
│   ├── jwt.ts                     # JWT sign/verify + bcrypt + OTP
│   ├── logger.ts                  # Winston logger instance
│   ├── morgan.ts                  # Colorized Morgan format
│   ├── multer.ts                  # File upload config
│   ├── nodemailer.ts              # Gmail SMTP transporter
│   ├── openapi.ts                 # Global OpenAPI registry singleton
│   └── apply-defaults.mongoose-plugins.ts
├── middleware/
│   ├── index.ts                   # Barrel export
│   ├── auth.middleware.ts         # requireAuth, requireRole, requireAnyRole, requireOwnership, optionalAuth
│   ├── validation.middleware.ts   # validateBody, validateParams, validateQuery, validate
│   └── common/
│       ├── default-not-found.ts   # 404 handler
│       └── global-error-handler.ts
└── data/
    └── index.ts                   # Placeholder for static data
```

---

## TypeScript Configuration

- **`@/*` path alias** maps to `./src/*` — always use `@/` for imports within `src/`
- `target: ESNext`, `module: ESNext`, `moduleResolution: bundler`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `strict: true` — all strict checks enabled
- `skipLibCheck: true`

---

## npm Scripts

| Script | Command | When to use |
|---|---|---|
| `pnpm dev` | `tsx watch src/app.ts` | Local development |
| `pnpm build` | `tsdown` | Production build |
| `pnpm start` | `node dist/app.js` | Run production output |
| `pnpm check-types` | `tsc -b` | Type-check without emit |
| `pnpm check` | `oxlint` | Run linter |
| `pnpm format` | `biome format --write ./src` | Format source files |
| `pnpm generate:module` | `node script/generate-module.js` | Scaffold a new API module |

---

## API Module Pattern

Every API domain follows a strict 4-file structure. Use the module generator to scaffold it:

```bash
pnpm generate:module --module job
pnpm generate:module --sub admin --module user   # nested module
```

### `[module].route.ts`

- Imports its own `.openapi.ts` as a **side-effect** (mandatory — triggers OpenAPI registration)
- Exports a named camelCase `Router`
- Chains `validateBody`, `validateParams`, or `validateQuery` before service handlers

```typescript
import "./job.openapi";
import express, { type Router } from "express";
import { requireAuth } from "@/middleware";
import { validateBody } from "@/middleware";
import { createJob, getAllJobs } from "./services";
import { CreateJobSchema } from "./job.validation";

export const job: Router = express.Router();

job.get("/", getAllJobs);
job.post("/", requireAuth, validateBody(CreateJobSchema), createJob);
```

### `[module].validation.ts`

- Call `extendZodWithOpenApi(z)` at the top of the file
- Define a base schema, then derive create/update/param/response schemas
- Export TypeScript types via `z.infer<typeof Schema>`

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const JobSchema = z.object({
  _id: z.string().openapi({ description: "Job ID" }),
  title: z.string().min(1).openapi({ description: "Job title" }),
}).openapi("Job");

export const CreateJobSchema = JobSchema.omit({ _id: true }).openapi("CreateJob");
export const UpdateJobSchema = JobSchema.partial().openapi("UpdateJob");
export const JobIdSchema = z.object({ id: z.string().min(1) }).openapi("JobIdParam");

export type Job = z.infer<typeof JobSchema>;
export type CreateJob = z.infer<typeof CreateJobSchema>;
```

### `[module].openapi.ts`

- Import `registry` from `@/lib/openapi`
- Import `openAPITags` and `mediaTypeFormat` from `@/common/constants`
- Call `registry.register()` for named schemas, `registry.registerPath()` for each endpoint
- Always document 200/201, 400, 401/403 where applicable, and 500 responses

```typescript
import { registry } from "@/lib/openapi";
import { openAPITags, mediaTypeFormat } from "@/common/constants";
import { CreateJobSchema, JobResponseSchema, ErrorResponseSchema } from "./job.validation";

registry.register("CreateJob", CreateJobSchema);

registry.registerPath({
  method: "post",
  path: openAPITags.job.basepath,
  tags: [openAPITags.job.name],
  summary: "Create a job",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { [mediaTypeFormat.json]: { schema: CreateJobSchema } } },
  },
  responses: {
    201: { description: "Job created", content: { [mediaTypeFormat.json]: { schema: JobResponseSchema } } },
    400: { description: "Validation error", content: { [mediaTypeFormat.json]: { schema: ErrorResponseSchema } } },
    500: { description: "Internal server error", content: { [mediaTypeFormat.json]: { schema: ErrorResponseSchema } } },
  },
});
```

### `services/[action].service.ts`

- Each file exports one `RequestHandler`
- Always use `sendSuccess` / `sendInternalError` from `@/helpers` — never call `res.json()` directly
- Wrap Mongoose operations in `exceptionErrorHandler` from `@/helpers`

```typescript
import type { RequestHandler } from "express";
import { sendSuccess, sendInternalError } from "@/helpers";
import { exceptionErrorHandler } from "@/helpers";
import { db } from "@/db";

export const createJob: RequestHandler = async (req, res) => {
  try {
    const job = await db.job.create(req.body);
    return sendSuccess(res, 201, "Job created successfully", job);
  } catch (error) {
    return exceptionErrorHandler(error, res, "Failed to create job");
  }
};
```

### Registering a new route in `app.ts`

After generating a module, add it to `src/app.ts` **before** the `notFoundHandler`:

```typescript
import { job } from "@/api/job/job.route";
// ...
app.use("/api/jobs", job);
```

---

## Response Helpers (`@/helpers`)

Never call `res.json()` directly. Always use these helpers:

| Function | Status | Use case |
|---|---|---|
| `sendSuccess(res, 200, "msg", data)` | 2xx | Successful retrieval / update |
| `sendCreated(res, "msg", data)` | 201 | Resource created |
| `sendNoContent(res)` | 204 | Delete with no body |
| `sendBadRequest(res, "msg", errors?)` | 400 | Validation / bad input |
| `sendUnauthorized(res, "msg")` | 401 | Missing or invalid token |
| `sendForbidden(res, "msg")` | 403 | Valid token, insufficient permissions |
| `sendNotFound(res, "msg")` | 404 | Resource not found |
| `sendInternalError(res, "msg")` | 500 | Unexpected errors |

All responses follow the `ApiResponse<T>` shape:
```json
{ "status": 200, "message": "...", "data": {...}, "success": true }
```

---

## MongoDB Error Handling

Use `exceptionErrorHandler` in every catch block that touches Mongoose:

```typescript
import { exceptionErrorHandler } from "@/helpers";

try {
  // ...mongoose operation
} catch (error) {
  return exceptionErrorHandler(error, res, "Optional default message");
}
```

It automatically maps:
- `CastError` → 400 "Invalid ID format"
- `ValidationError` → 400 with per-field error array
- Duplicate key (`E11000`) → 400 "Duplicate value for `<field>`"
- Everything else → 500

To validate ObjectId params manually:
```typescript
import { validateObjectIds } from "@/helpers";

const { isValid, invalidIds } = validateObjectIds([req.params.id]);
if (!isValid) return sendBadRequest(res, "Invalid ID");
```

---

## Auth Middleware (`@/middleware`)

| Middleware | Purpose |
|---|---|
| `requireAuth` | Verifies `Authorization: Bearer <token>`, attaches `req.user` |
| `requireRole("admin")` | Exact single-role check (must follow `requireAuth`) |
| `requireAnyRole(["customer", "admin"])` | Multi-role check |
| `requireOwnership("id")` | Resource owner check; admins bypass |
| `optionalAuth` | Attaches `req.user` if token present, never fails |

`req.user` type (globally augmented):
```typescript
{ userId: string; email: string; role: "customer" | "contractor" | "admin" }
```

JWT utilities live in `@/lib/jwt`:
- `signAccessToken(payload)` — 15-day access token
- `signRefreshToken(payload)` — 30-day refresh token with `jti`
- `verifyAccessToken(token)` / `verifyRefreshToken(token)`
- `hashPassword` / `comparePassword` — bcrypt, salt rounds 10
- `generateOTP()` — 4-digit numeric OTP

---

## Validation Middleware

```typescript
import { validateBody, validateParams, validateQuery, validate } from "@/middleware";

// Individual
router.post("/", validateBody(CreateSchema), handler);
router.get("/:id", validateParams(IdSchema), handler);
router.get("/", validateQuery(QuerySchema), handler);

// Combined
router.put("/:id", validate({ params: IdSchema, body: UpdateSchema }), handler);
```

Validation errors return:
```json
{ "success": false, "message": "fieldName is required", "errors": [{ "field": "...", "message": "..." }] }
```

---

## Database Pattern

### Adding a model

Create `src/db/models/[model].model.ts`:
```typescript
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  { title: { type: String, required: true } },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
```

Register in `src/db/index.ts`:
```typescript
import { Job } from "./models/job.model";
export const db = { job: Job };
```

Use in services:
```typescript
import { db } from "@/db";
const jobs = await db.job.find();
```

The global `applyDefaultsPlugin` (`src/lib/apply-defaults.mongoose-plugins.ts`) is registered on `mongoose` before any model compiles. It fills missing fields with sensible defaults (`""`, `0`, `false`, `[]`) when documents are loaded or serialized — no field will appear as `undefined` in API responses.

### Connecting

Call `connectDB()` from `@/lib` inside `app.listen()`:
```typescript
app.listen(port, async () => {
  await connectDB();
  // ...
});
```

---

## OpenAPI Documentation

Two UI endpoints are available after startup:
- Swagger UI: `http://localhost:4000/swagger`
- Scalar UI: `http://localhost:4000/scaler`
- Raw JSON spec: `http://localhost:4000/api-docs.json`

The spec is built once at startup by collecting all side-effect imports from route files. The generation order matters: **all route imports must happen before `generateOpenAPIDocument()` is called**.

For protected endpoints, add `security: [{ bearerAuth: [] }]` to `registry.registerPath()`. The `bearerAuth` security scheme must be registered once in `src/lib/openapi.ts`:
```typescript
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
```

### `src/common/constants.ts` pattern

This file does not exist yet in the starter but must be created when adding the first real module:

```typescript
export const openAPITags = {
  job: { name: "Jobs", basepath: "/api/job" },
  auth: { name: "Authentication", basepath: "/api/auth" },
  // ...
};

export const mediaTypeFormat = {
  json: "application/json",
  form: "multipart/form-data",
};
```

---

## Logging (`@/lib`)

Import `logger` or the helper functions — never use `console.log` in production code (use `console.log` only in catch blocks as a fallback during development):

```typescript
import { logger, logError, logInfo, logWarn } from "@/lib";

logInfo("User created", { userId: "123" });
logError("DB failed", error);
logWarn("Rate limit approaching");
```

Log files rotate daily under `logs/`:
- `error-YYYY-MM-DD.log` — errors only (14-day retention)
- `combined-YYYY-MM-DD.log` — all levels (14-day retention)
- `http-YYYY-MM-DD.log` — HTTP requests (7-day retention)

Level is controlled by `process.env.LOG_LEVEL` (default: `"info"`).

---

## File Uploads

```typescript
import { upload, getFileUrl, deleteFile } from "@/lib";

// Single file
router.post("/upload", upload.single("image"), (req, res) => {
  const url = getFileUrl(req.file!.filename);
  return sendSuccess(res, 201, "Uploaded", { url });
});

// Multiple files
router.post("/upload", upload.array("images", 5), handler);
```

Uploads are stored in `uploads/` (project root), served as static files at `/uploads/[filename]`. Limits: images only (JPEG, PNG, GIF, WebP, SVG), 5 MB max.

---

## Email

```typescript
import { transporter } from "@/lib";

await transporter.sendMail({
  from: process.env.SMTP_USER,
  to: "user@example.com",
  subject: "Welcome",
  html: "<p>Hello</p>",
});
```

Requires `SMTP_USER` and `SMTP_PASS` env vars (Gmail SMTP).

---

## Linting & Formatting

The project uses a **dual linter** approach:

- **Biome** — formatting (tabs, double quotes) and general JS/TS rules
- **Oxlint** — additional semantic TypeScript rules (floating promises, template expressions, etc.)

```bash
pnpm format          # format with Biome
pnpm check           # lint with oxlint
```

Pre-commit: `lint-staged` runs `oxlint` on all staged JS/TS files automatically.

Key style rules:
- Indentation: **tabs** (not spaces)
- Quotes: **double quotes**
- `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- Imports are organized automatically by Biome

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `PORT` | Server port | `4000` |
| `API_BASE_URL` | Base URL for OpenAPI spec | `http://localhost:4000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `ACCESS_SECRET` | JWT access token secret | change in production |
| `REFRESH_SECRET` | JWT refresh token secret | change in production |
| `LOG_LEVEL` | Winston log level | `info` |
| `SMTP_USER` | Gmail address for nodemailer | — |
| `SMTP_PASS` | Gmail app password | — |

Never commit `.env` — it is in `.gitignore`.

---

## CI/CD Notes

The GitHub Actions workflow at `.github/workflows/build.yml` currently has gaps — it uses `npm` instead of `pnpm`, and references `npm run lint` and `npm run test` scripts that do not exist. When fixing CI:

1. Replace `npm install` with `pnpm install --frozen-lockfile`
2. Replace `npm run lint` with `pnpm check`
3. Remove or stub `npm run test` until a test suite is added
4. Add `pnpm/action-setup` step before `actions/setup-node`
