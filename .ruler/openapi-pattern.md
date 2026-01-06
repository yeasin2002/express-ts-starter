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

Register schemas and routes with the global registry:

```typescript
import { registry } from "@/lib/openapi";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserIdSchema,
  UserResponseSchema,
  UsersResponseSchema,
  ErrorResponseSchema,
} from "./user.schema";

// Register schemas (optional but recommended for reusability)
registry.register("CreateUser", CreateUserSchema);
registry.register("UpdateUser", UpdateUserSchema);
registry.register("UserIdParam", UserIdSchema);
registry.register("UserResponse", UserResponseSchema);
registry.register("UsersResponse", UsersResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

// Register GET /api/user
registry.registerPath({
  method: "get",
  path: "/api/user",
  description: "Get all users",
  summary: "Retrieve all users",
  tags: ["Users"],
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
  path: "/api/user",
  description: "Create a new user",
  summary: "Create user",
  tags: ["Users"],
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

// Register PUT /api/user/{id}
registry.registerPath({
  method: "put",
  path: "/api/user/{id}",
  description: "Update a user",
  summary: "Update user",
  tags: ["Users"],
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

// Register DELETE /api/user/{id}
registry.registerPath({
  method: "delete",
  path: "/api/user/{id}",
  description: "Delete a user",
  summary: "Delete user",
  tags: ["Users"],
  request: {
    params: UserIdSchema,
  },
  responses: {
    200: {
      description: "User deleted successfully",
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
