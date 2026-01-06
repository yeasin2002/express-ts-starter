# Module Generator

## Overview

JobSphere includes an automated module scaffolding tool that generates boilerplate code for new API modules. This significantly speeds up development by creating consistent, type-safe module structures.

## Usage

### Interactive Mode

```bash
bun run generate:module
```

The script will prompt for a module name and automatically generate all necessary files.

### Direct Mode (with --module flag)

```bash
# Create a top-level module without prompt
bun run generate:module --module auth

# Create a nested sub-module without prompt
bun run generate:module --sub admin --module user
```

### Nested Module Mode (with --sub flag)

```bash
# Interactive: prompts for sub-module name
bun run generate:module --sub admin

# Direct: no prompts
bun run generate:module --sub admin --module dashboard
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

**Benefits:**
- Keeps modules organized and maintainable
- Separates concerns (one file per action)
- Easier to test individual services
- Reduces file size and complexity

## Generated Files

### 1. `[module].route.ts` - Express Router

- Defines all HTTP endpoints (GET, POST, PUT, DELETE)
- Integrates validation middleware
- Imports service handlers from `services/` folder
- Exports router as camelCase variable
- Example: `import { login, register } from "./services";`

### 2. `services/` folder - Business Logic

#### `services/index.ts` - Barrel Export

- Exports all service handlers
- Example: `export * from "./login.service";`

#### `services/[action].service.ts` - Individual Handlers

- Contains business logic for specific actions
- Properly typed RequestHandler functions
- Database operations using `db.[module]`
- Consistent error handling using helper functions
- Standard JSON response format:
  ```typescript
  {
    status: number,
    message: string,
    data: any | null
  }
  ```

**Example service file:**

```typescript
import type { RequestHandler } from "express";
import { sendInternalError, sendSuccess } from "@/helpers";

export const login: RequestHandler = async (req, res) => {
  try {
    // Business logic here
    return sendSuccess(res, 200, "Login successful", data);
  } catch (error) {
    console.log(error);
    return sendInternalError(res, "Internal Server Error");
  }
};
```

### 3. `[module].validation.ts` - Validation & Types

- Zod schemas with OpenAPI documentation
- Runtime validation schemas
- TypeScript type exports
- Includes:
  - Base schema with all fields
  - Create schema (omits \_id, timestamps)
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

### 1. Create Database Model

Create a Mongoose model in `src/db/models/`:

```typescript
// src/db/models/job.model.ts
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Add your fields here
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
```

### 2. Register Model in Database Index

Add to `src/db/index.ts`:

```typescript
import { Job } from "./models/job.model";

export const db = {
  user: User,
  job: Job, // Add this line
};
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

**Export naming convention:**
- Top-level modules: Use module name (e.g., `job`, `auth`, `category`)
- Nested modules: Use `parentModule` + `ModuleName` in camelCase (e.g., `adminUser`, `adminDashboard`)
- This prevents naming conflicts between top-level and nested modules

### 4. Customize Schema

Update the generated schema with your specific fields:

```typescript
export const JobSchema = z.object({
  _id: z.string().openapi({ description: "Job ID" }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10),
  budget: z.number().positive(),
  category: z.enum(["plumbing", "electrical", "cleaning"]),
  status: z.enum(["open", "in_progress", "completed"]),
  customerId: z.string(),
  contractorId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
```

### 5. Add Business Logic

Create individual service files in the `services/` folder:

**Example: `services/create-job.service.ts`**

```typescript
import type { CreateJob } from "../job.validation";
import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

export const createJob: RequestHandler<{}, any, CreateJob> = async (
  req,
  res
) => {
  try {
    // Add custom validation
    if (req.body.budget < 10) {
      return sendError(res, 400, "Budget must be at least $10");
    }

    // Add authentication context
    const job = await db.job.create({
      ...req.body,
      customerId: req.user.id, // From auth middleware
      status: "open",
    });

    return sendSuccess(res, 201, "Job created successfully", job);
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Internal Server Error");
  }
};
```

**Then export in `services/index.ts`:**

```typescript
export * from "./create-job.service";
export * from "./get-jobs.service";
export * from "./update-job.service";
export * from "./delete-job.service";
```

**Use in route file:**

```typescript
import { createJob, getJobs, updateJob, deleteJob } from "./services";

job.post("/", validateBody(CreateJobSchema), createJob);
job.get("/", getJobs);
job.put("/:id", validateBody(UpdateJobSchema), updateJob);
job.delete("/:id", deleteJob);
```

## Features

- ✅ Full CRUD operations out of the box
- ✅ Zod validation with OpenAPI documentation
- ✅ TypeScript types automatically exported
- ✅ Consistent error handling
- ✅ Standard response format
- ✅ Path alias support (`@/`)
- ✅ Follows project conventions
- ✅ No additional dependencies required

## Script Location

`script/generate-module.js`

## Documentation

- `script/README.md` - Main documentation
- `script/USAGE_EXAMPLES.md` - Detailed examples
- `script/CHANGELOG.md` - Version history

## When to Use

Use the module generator when:

- Creating new API endpoints
- Adding new resource types (jobs, bookings, reviews, etc.)
- Building CRUD operations for new entities
- Maintaining consistent code structure

## When NOT to Use

Don't use the generator for:

- Authentication endpoints (use existing auth module)
- WebSocket handlers (different pattern)
- Webhook endpoints (different pattern)
- Static file serving
- Middleware functions

## Tips

- Always run `bun check-types` after generation to verify TypeScript
- Customize the generated code to fit your specific needs
- The generator creates a starting point, not a final implementation
- Add authentication middleware to routes as needed
- Consider adding rate limiting for public endpoints
