# Module Generator

## Overview

This starter template includes an automated module scaffolding tool that generates boilerplate code for new API modules. This significantly speeds up development by creating consistent, type-safe module structures.

## Usage

### Interactive Mode

```bash
pnpm generate:module
```

The script will prompt for a module name and automatically generate all necessary files.

### Direct Mode (with --module flag)

```bash
# Create a top-level module without prompt
pnpm generate:module --module job

# Create a nested sub-module without prompt
pnpm generate:module --sub admin --module user
```

### Nested Module Mode (with --sub flag)

```bash
# Interactive: prompts for sub-module name
pnpm generate:module --sub admin

# Direct: no prompts
pnpm generate:module --sub admin --module dashboard
```

**Flags:**
- `--module <name>`: Specify module name directly (skips prompt)
- `--sub <parent>`: Create as a sub-module under the specified parent module
- Both flags can be combined for fully automated nested module creation

## Generated Structure

### Top-Level Module

For a module named `job`, the generator creates:

```
src/api/job/
├── job.route.ts        # Express router
├── services/           # Service handlers folder
│   ├── index.ts        # Barrel export for all services
│   └── example.service.ts  # Example service handler
├── job.validation.ts   # Zod validation schemas + TypeScript types
└── job.openapi.ts      # OpenAPI documentation
```

### Nested Sub-Module

For a sub-module `user` under parent `admin`, the generator creates:

```
src/api/admin/user/
├── user.route.ts       # Express router (exports as 'adminUser')
├── services/           # Service handlers folder
│   ├── index.ts        # Barrel export for all services
│   └── example.service.ts  # Example service handler
├── user.validation.ts  # Zod validation schemas + TypeScript types
└── user.openapi.ts     # OpenAPI documentation
```

**Note:** If the parent module doesn't exist, it will be created automatically.

### Services Folder Structure

The generator creates a `services/` folder to organize business logic:

- **`index.ts`**: Exports all service handlers for easy importing
- **`example.service.ts`**: Template service handler to get started
- **Additional services**: Create new files like `login.service.ts`, `register.service.ts`, etc.

## Generated Files

### 1. `[module].route.ts` - Express Router

- Defines all HTTP endpoints (GET, POST, PUT, DELETE)
- Integrates validation middleware
- Imports service handlers from `services/` folder
- Exports router as camelCase variable
- Example: `import { createJob, getJobs } from "./services";`

### 2. `services/` folder - Business Logic

#### `services/index.ts` - Barrel Export

- Exports all service handlers
- Example: `export * from "./create-job.service";`

#### `services/[action].service.ts` - Individual Handlers

- Contains business logic for specific actions
- Properly typed RequestHandler functions
- Database operations using Drizzle ORM `db` and schema
- Consistent error handling using `dbErrorHandler`
- Standard JSON response format:
  ```typescript
  {
    status: number,
    message: string,
    data: any | null,
    success: boolean
  }
  ```

**Example service file:**

```typescript
import type { RequestHandler } from "express";
import { db, jobs } from "@/db";
import { dbErrorHandler, sendSuccess } from "@/helpers";

export const getJobs: RequestHandler = async (req, res) => {
  try {
    const data = await db.select().from(jobs);
    return sendSuccess(res, 200, "Jobs fetched successfully", data);
  } catch (error) {
    return dbErrorHandler(error, res, "Failed to retrieve jobs");
  }
};
```

### 3. `[module].validation.ts` - Validation & Types

- Zod schemas with OpenAPI documentation
- Runtime validation schemas
- TypeScript type exports
- Includes:
  - Base schema with all fields
  - Create schema (omits auto-generated fields like id, timestamps)
  - Update schema (all fields optional)
  - ID parameter schema
  - Response schemas
  - Error response schema

## Naming Conventions

The generator handles various input formats:

**Top-level modules:**
- **Input**: `job` → **Files**: `job.route.ts`, **Types**: `Job`, **Export**: `job`
- **Input**: `job-application` → **Files**: `job-application.route.ts`, **Types**: `JobApplication`, **Export**: `jobApplication`
- **Input**: `payment_method` → **Files**: `payment_method.route.ts`, **Types**: `PaymentMethod`, **Export**: `paymentMethod`

**Nested sub-modules:**
- **Input**: `--sub admin --module user` → **Files**: `admin/user/user.route.ts`, **Export**: `adminUser`
- **Input**: `--sub admin --module dashboard` → **Files**: `admin/dashboard/dashboard.route.ts`, **Export**: `adminDashboard`
- **Route paths**: Nested modules use combined paths (e.g., `/api/admin/users`)

## Post-Generation Steps

After generating a module, you must:

### 1. Create PostgreSQL Schema Table

Create a Drizzle table in `src/db/schema/`:

```typescript
// src/db/schema/job.schema.ts
import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  budget: integer("budget").default(0),
  status: text("status").default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const insertJobSchema = createInsertSchema(jobs);
export const selectJobSchema = createSelectSchema(jobs);
```

### 2. Register Schema in Database Index

Add to `src/db/schema/index.ts`:

```typescript
export * from "./example.schema";
export * from "./job.schema"; // Add this line
```

Run migrations:
```bash
pnpm db:generate
pnpm db:migrate
# or for rapid prototyping:
pnpm db:push
```

### 3. Register Route in App

Add to `src/app.ts`:

**For top-level modules:**
```typescript
import { job } from "./api/job/job.route";

app.use("/api/jobs", job);
```

**For nested sub-modules:**
```typescript
import { adminUser } from "@/api/admin/user/user.route";

app.use("/api/admin/users", adminUser);
```

### 4. Customize Schema

Update the generated validation schema in `src/api/[module]/[module].validation.ts` with your specific validation rules.

### 5. Add Business Logic

Create individual service files in the `services/` folder using Drizzle ORM:

```typescript
import type { RequestHandler } from "express";
import { db, jobs } from "@/db";
import { dbErrorHandler, sendCreated } from "@/helpers";

export const createJob: RequestHandler = async (req, res) => {
  try {
    const [newJob] = await db.insert(jobs).values(req.body).returning();
    return sendCreated(res, "Job created successfully", newJob);
  } catch (error) {
    return dbErrorHandler(error, res, "Failed to create job");
  }
};
```

Export in `services/index.ts` and use in `job.route.ts`.

## Features

- ✅ Full CRUD operations out of the box
- ✅ Zod validation with OpenAPI documentation
- ✅ PostgreSQL table definitions with Drizzle ORM
- ✅ TypeScript types automatically exported
- ✅ Consistent error handling with `dbErrorHandler`
- ✅ Standard response format
- ✅ Path alias support (`@/`)
- ✅ Follows project conventions
- ✅ No additional dependencies required
