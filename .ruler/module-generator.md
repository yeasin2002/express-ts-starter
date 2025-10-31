# Module Generator

## Overview

JobSphere includes an automated module scaffolding tool that generates boilerplate code for new API modules. This significantly speeds up development by creating consistent, type-safe module structures.

## Usage

```bash
bun run generate:module
```

The script will prompt for a module name and automatically generate all necessary files.

## Generated Structure

For a module named `job`, the generator creates:

```
src/api/job/
├── job.route.ts      # Express router with CRUD endpoints
├── job.service.ts    # Business logic request handlers
└── job.schema.ts     # Zod validation schemas + TypeScript types
```

## Generated Files

### 1. `[module].route.ts` - Express Router

- Defines all HTTP endpoints (GET, POST, PUT, DELETE)
- Integrates validation middleware
- Exports router as camelCase variable
- Example endpoints:
  - `GET /` - Get all items
  - `POST /` - Create new item
  - `PUT /:id` - Update item by ID
  - `DELETE /:id` - Delete item by ID

### 2. `[module].service.ts` - Request Handlers

- Contains business logic for each endpoint
- Properly typed RequestHandler functions
- Database operations using `db.[module]`
- Consistent error handling
- Standard JSON response format:
  ```typescript
  {
    status: number,
    message: string,
    data: any | null
  }
  ```

### 3. `[module].schema.ts` - Validation & Types

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

- **Input**: `job` → **Files**: `job.route.ts`, **Types**: `Job`, **Variable**: `job`
- **Input**: `job-application` → **Files**: `job-application.route.ts`, **Types**: `JobApplication`
- **Input**: `payment_method` → **Files**: `payment_method.route.ts`, **Types**: `PaymentMethod`

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

```typescript
import { job } from "./api/job/job.route";

app.use("/api/jobs", job);
```

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

Customize the service handlers with specific logic:

```typescript
export const createJob: RequestHandler<{}, any, CreateJob> = async (
  req,
  res
) => {
  try {
    // Add custom validation
    if (req.body.budget < 10) {
      return res.status(400).json({
        status: 400,
        message: "Budget must be at least $10",
        data: null,
      });
    }

    // Add authentication context
    const job = await db.job.create({
      ...req.body,
      customerId: req.user.id, // From auth middleware
      status: "open",
    });

    res.status(201).json({
      status: 201,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};
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
