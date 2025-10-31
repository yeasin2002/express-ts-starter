# OpenAPI Documentation Pattern

## Overview

JobSphere uses `@asteasolutions/zod-to-openapi` to generate OpenAPI documentation from Zod schemas. Each API module has a dedicated `.openapi.ts` file that registers schemas and routes with the global OpenAPI registry.

## File Structure Per Module

```
src/api/[module]/
├── [module].route.ts      # Express routes
├── [module].service.ts    # Business logic
├── [module].schema.ts     # Zod schemas + TypeScript types
└── [module].openapi.ts    # OpenAPI registration
```

## Step-by-Step Implementation

### 1. Create Schemas (`[module].schema.ts`)

Define Zod schemas with OpenAPI extensions:

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI (required once per file)
extendZodWithOpenApi(z);

// Base schema
export const UserSchema = z.object({
  _id: z.string().openapi({ description: "User ID" }),
  name: z.string().min(1).openapi({ description: "User's full name" }),
  email: z.string().email().openapi({ description: "User's email" }),
  // ... other fields
});

// Create schema (omit auto-generated fields)
export const CreateUserSchema = UserSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).openapi("CreateUser");

// Update schema (all fields optional)
export const UpdateUserSchema = UserSchema.partial().openapi("UpdateUser");

// Param schema
export const UserIdSchema = z.object({
  id: z.string().min(1).openapi({ description: "User ID" }),
}).openapi("UserIdParam");

// Response schemas
export const UserResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: UserSchema.nullable(),
}).openapi("UserResponse");

export const UsersResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.array(UserSchema),
}).openapi("UsersResponse");

export const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null(),
}).openapi("ErrorResponse");

// Export types
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
// ... other types
```

### 2. Register OpenAPI Specs (`[module].openapi.ts`)

Register schemas and routes with the global registry using centralized constants:

```typescript
import { openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserIdSchema,
  UserResponseSchema,
  UsersResponseSchema,
  ErrorResponseSchema,
} from "./user.validation";

// Register schemas (optional but recommended for reusability)
registry.register("CreateUser", CreateUserSchema);
registry.register("UpdateUser", UpdateUserSchema);
registry.register("UserIdParam", UserIdSchema);
registry.register("UserResponse", UserResponseSchema);
registry.register("UsersResponse", UsersResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

// Register GET /api/user - Use centralized constants
registry.registerPath({
  method: "get",
  path: openAPITags.user.basepath,
  description: "Get all users",
  summary: "Retrieve all users",
  tags: [openAPITags.user.name],
  responses: {
    200: {
      description: "Users retrieved successfully",
      content: {
        "application/json": {
          schema: UsersResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Register POST /api/user
registry.registerPath({
  method: "post",
  path: openAPITags.user.basepath,
  description: "Create a new user",
  summary: "Create user",
  tags: [openAPITags.user.name],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: UserResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Register PUT /api/user/{id} - Use template literals for paths with params
registry.registerPath({
  method: "put",
  path: `${openAPITags.user.basepath}/{id}`,
  description: "Update a user",
  summary: "Update user",
  tags: [openAPITags.user.name],
  request: {
    params: UserIdSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User updated successfully",
      content: {
        "application/json": {
          schema: UserResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
```

## Centralized Constants Pattern

All API paths and tags are defined in `src/common/constants.ts`:

```typescript
export const openAPITags = {
  authentication: { name: "Authentication", basepath: "/api/auth" },
  user: {
    me: { name: "user", basepath: "/api/user/me" },
    all_users: { name: "user", basepath: "/api/user/" },
  },
  job: { name: "job", basepath: "/api/job" },
  job_request: {
    name: "Job Application Request",
    basepath: "/api/job-request",
  },
  category: { name: "category", basepath: "/api/category" },
  location: { name: "location", basepath: "/api/location" },
  payment: { name: "payment", basepath: "/api/payment" },
  setting: { name: "setting", basepath: "/api/setting" },
  common: { 
    imag_upload: { name: "common", basepath: "/api/common/upload" } 
  },
  admin: {
    auth: {
      name: "Admin - Authentication",
      basepath: "/api/admin/auth",
    },
    dashboard: {
      name: "Admin - Dashboard",
      basepath: "/api/admin/dashboard",
    },
    user_management: {
      name: "Admin - User Management",
      basepath: "/api/admin/users",
    },
    job_management: {
      name: "Admin - Job Management",
      basepath: "/api/admin/jobs",
    },
    payment_management: {
      name: "Admin - Payment Management",
      basepath: "/api/admin/payments",
    },
    setting_management: {
      name: "Admin - Settings",
      basepath: "/api/admin/settings",
    },
  },
};

export const mediaTypeFormat = {
  json: "application/json",
  form: "multipart/form-data",
};
```

**Benefits:**
- Single source of truth for all API paths
- Easy to refactor and maintain
- Consistent naming across documentation
- Type-safe with TypeScript
- Prevents typos and inconsistencies

**Usage:**
- Import: `import { openAPITags, mediaTypeFormat } from "@/common/constants";`
- Simple base path: `path: openAPITags.job.basepath`
- Nested base path: `path: openAPITags.user.all_users.basepath`
- With params: `path: \`\${openAPITags.job.basepath}/{id}\``
- Tags: `tags: [openAPITags.job.name]`
- Admin modules: `openAPITags.admin.user_management.basepath`
- Media types: `mediaTypeFormat.json` or `mediaTypeFormat.form`

### 3. Import in `[module].route.ts`

```typescript
import "./user.openapi";
```

## OpenAPI Registry Configuration

The global registry is configured in `src/lib/openapi.ts`:

```typescript
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

export const generateOpenAPIDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "JobSphere API",
      version: "1.0.0",
      description: "Backend API service for JobSphere marketplace",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:4000",
        description: "Development server",
      },
    ],
  });
};
```

## Common Patterns

### Request Body Validation

```typescript
request: {
  body: {
    content: {
      "application/json": {
        schema: CreateUserSchema,
      },
    },
  },
}
```

### Path Parameters

```typescript
request: {
  params: UserIdSchema,
}
```

### Query Parameters

```typescript
request: {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
}
```

### Multiple Response Codes

```typescript
responses: {
  200: {
    description: "Success",
    content: {
      "application/json": {
        schema: SuccessSchema,
      },
    },
  },
  400: {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  401: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  500: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
}
```

### Authentication

```typescript
registry.registerPath({
  method: "get",
  path: "/api/protected",
  summary: "Protected endpoint",
  tags: ["Protected"],
  security: [{ bearerAuth: [] }],
  // ... rest of config
});

// Register security scheme in openapi.ts
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
```

## Documentation Endpoints

After setup, documentation is available at:

- **Swagger UI**: `http://localhost:4000/api-docs`
- **Scalar UI**: `http://localhost:4000/scaler`
- **JSON Spec**: `http://localhost:4000/api-docs.json`

## Best Practices

1. **Always extend Zod with OpenAPI** at the top of schema files
2. **Use `.openapi()` method** to name schemas for better documentation
3. **Import `.openapi.ts` files** in `app.ts` before generating docs
4. **Group routes by tags** for better organization in UI
5. **Provide clear descriptions** for all schemas and endpoints
6. **Include all possible response codes** (200, 400, 401, 404, 500)
7. **Reuse common schemas** like ErrorResponse across modules
8. **Keep schemas DRY** - define base schema and derive others

## Troubleshooting

### Routes not appearing in documentation
- Ensure `.openapi.ts` file is imported in `app.ts`
- Check import order (must be before `generateOpenAPIDocument()`)
- Verify `registry.registerPath()` is called

### Schema validation not working
- Ensure `extendZodWithOpenApi(z)` is called
- Check schema is properly exported from `.schema.ts`
- Verify validation middleware is applied in routes

### Type errors
- Ensure schemas are exported with proper types
- Use `z.infer<typeof Schema>` for type extraction
- Check TypeScript strict mode compatibility
