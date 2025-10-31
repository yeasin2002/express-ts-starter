# Common Validations

This folder contains reusable Zod validation schemas that can be shared across all API modules for consistent validation and OpenAPI documentation.

## Overview

Instead of duplicating response schemas, parameter schemas, and common validation patterns in every module, these common schemas provide:

- **Consistency**: Same response format across all endpoints
- **Maintainability**: Update once, apply everywhere
- **Type Safety**: Full TypeScript support
- **OpenAPI Integration**: Automatic API documentation generation

## Files

### 1. `mongodb-id.validation.ts`

MongoDB ObjectId validation schema.

```typescript
import { objectIdSchema } from "@/common/validations";

const schema = z.object({
  userId: objectIdSchema,
  categoryId: objectIdSchema,
});
```

### 2. `response.validation.ts`

Common response schemas for consistent API responses.

#### Success Responses

```typescript
import { SuccessResponseSchema } from "@/common/validations";

// Basic success (no data)
export const DeleteResponseSchema = SuccessResponseSchema;

// Success with flag
import { SuccessResponseWithFlagSchema } from "@/common/validations";
```

#### Error Responses

```typescript
import {
  ErrorResponseSchema,
  ValidationErrorResponseSchema,
  NotFoundResponseSchema,
  UnauthorizedResponseSchema,
  InternalServerErrorResponseSchema,
} from "@/common/validations";

// Use in OpenAPI registration
responses: {
  400: {
    description: "Validation error",
    content: {
      "application/json": {
        schema: ValidationErrorResponseSchema,
      },
    },
  },
  404: {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: NotFoundResponseSchema,
      },
    },
  },
  500: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: InternalServerErrorResponseSchema,
      },
    },
  },
}
```

#### Available Error Schemas

- `ErrorResponseSchema` - Generic error (400, 500, etc.)
- `ErrorResponseWithFlagSchema` - Error with success flag
- `ValidationErrorResponseSchema` - Validation errors with field details
- `BadRequestResponseSchema` - 400 Bad Request
- `UnauthorizedResponseSchema` - 401 Unauthorized
- `ForbiddenResponseSchema` - 403 Forbidden
- `NotFoundResponseSchema` - 404 Not Found
- `ConflictResponseSchema` - 409 Conflict
- `InternalServerErrorResponseSchema` - 500 Internal Server Error

#### Pagination Schemas

```typescript
import {
  PaginationMetadataSchema,
  SimplePaginationSchema,
} from "@/common/validations";

// Detailed pagination
const ResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    items: z.array(ItemSchema),
    pagination: PaginationMetadataSchema,
  }),
});

// Simple pagination
const ResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    items: z.array(ItemSchema),
    pagination: SimplePaginationSchema,
  }),
});
```

### 3. `param.validation.ts`

Common parameter and query schemas.

#### ID Parameters

```typescript
import {
  IdParamSchema,
  UserIdParamSchema,
  JobIdParamSchema,
  CategoryIdParamSchema,
  LocationIdParamSchema,
} from "@/common/validations";

// Generic ID
export const MyResourceIdSchema = IdParamSchema;

// Specific resource IDs
export const GetUserSchema = UserIdParamSchema;
export const GetJobSchema = JobIdParamSchema;
```

#### Pagination Queries

```typescript
import {
  PaginationQuerySchema,
  PaginationQueryTransformSchema,
  PaginationWithSortQuerySchema,
} from "@/common/validations";

// Basic pagination (strings)
export const ListQuerySchema = PaginationQuerySchema;

// Pagination with transform (converts to numbers)
export const ListQuerySchema = PaginationQueryTransformSchema;

// Pagination with sorting
export const ListQuerySchema = PaginationWithSortQuerySchema.extend({
  // Add module-specific filters
  status: z.enum(["active", "inactive"]).optional(),
});
```

#### Search Queries

```typescript
import {
  SearchQuerySchema,
  SearchWithPaginationQuerySchema,
} from "@/common/validations";

// Basic search
export const SearchSchema = SearchQuerySchema;

// Search with pagination
export const SearchSchema = SearchWithPaginationQuerySchema.extend({
  // Add module-specific filters
  category: objectIdSchema.optional(),
});
```

## Usage Examples

### Example 1: Simple CRUD Module

```typescript
// src/api/product/product.validation.ts
import {
  ErrorResponseSchema,
  NotFoundResponseSchema,
  InternalServerErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
  PaginationWithSortQuerySchema,
} from "@/common/validations";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Product-specific schemas
export const ProductSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    price: z.number(),
  })
  .openapi("Product");

// Reuse common schemas
export const ProductIdParamSchema = IdParamSchema;
export const ProductQuerySchema = PaginationWithSortQuerySchema;

// Response schemas
export const ProductResponseSchema = z
  .object({
    status: z.number(),
    message: z.string(),
    data: ProductSchema,
  })
  .openapi("ProductResponse");

// Reuse common error schemas
export {
  ErrorResponseSchema,
  NotFoundResponseSchema,
  InternalServerErrorResponseSchema,
  SuccessResponseSchema,
};
```

### Example 2: OpenAPI Registration

```typescript
// src/api/product/product.openapi.ts
import { registry } from "@/lib/openapi";
import {
  ErrorResponseSchema,
  NotFoundResponseSchema,
  InternalServerErrorResponseSchema,
} from "@/common/validations";
import {
  ProductResponseSchema,
  ProductIdParamSchema,
} from "./product.validation";

// GET /api/products/{id}
registry.registerPath({
  method: "get",
  path: "/api/products/{id}",
  summary: "Get product by ID",
  tags: ["Products"],
  request: {
    params: ProductIdParamSchema,
  },
  responses: {
    200: {
      description: "Product retrieved successfully",
      content: {
        "application/json": {
          schema: ProductResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: NotFoundResponseSchema, // Reused!
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseSchema, // Reused!
        },
      },
    },
  },
});
```

### Example 3: Extending Common Schemas

```typescript
// Add module-specific fields to common schemas
import { PaginationWithSortQuerySchema } from "@/common/validations";

export const UserQuerySchema = PaginationWithSortQuerySchema.extend({
  role: z.enum(["customer", "contractor", "admin"]).optional(),
  location: objectIdSchema.optional(),
  isVerified: z.boolean().optional(),
}).openapi("UserQuery");
```

## Benefits

### Before (Duplicated Code)

Every module had its own:

```typescript
// auth.validation.ts
export const ErrorResponseSchema = z
  .object({
    status: z.number(),
    message: z.string(),
    data: z.null(),
  })
  .openapi("ErrorResponse");

// category.validation.ts
export const ErrorResponseSchema = z
  .object({
    status: z.number(),
    message: z.string(),
    data: z.null(),
  })
  .openapi("ErrorResponse");

// job.validation.ts
export const ErrorResponseSchema = z
  .object({
    status: z.number(),
    message: z.string(),
    data: z.null(),
  })
  .openapi("ErrorResponse");

// ... repeated in 10+ files
```

### After (Reusable Code)

```typescript
// All modules import from common
import { ErrorResponseSchema } from "@/common/validations";

// Use directly in OpenAPI
responses: {
  500: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
}
```

## Migration Guide

To migrate existing modules to use common validations:

1. **Import common schemas**:

   ```typescript
   import {
     ErrorResponseSchema,
     NotFoundResponseSchema,
     SuccessResponseSchema,
   } from "@/common/validations";
   ```

2. **Remove duplicate schemas** from your validation file

3. **Export common schemas** if needed:

   ```typescript
   export { ErrorResponseSchema, NotFoundResponseSchema };
   ```

4. **Update OpenAPI registrations** to use common schemas

5. **Test** to ensure everything works

## Best Practices

1. **Always use common schemas** for standard responses (errors, success, pagination)
2. **Extend common schemas** when you need module-specific fields
3. **Don't modify common schemas** - create new ones if needed
4. **Keep module-specific schemas** in module validation files
5. **Document custom schemas** with OpenAPI descriptions

## Adding New Common Schemas

When you find a pattern repeated across 3+ modules:

1. Add it to the appropriate file (`response.validation.ts`, `param.validation.ts`)
2. Export it from `index.ts`
3. Document it in this README
4. Update existing modules to use it

## Schema Naming Conventions

- Response schemas: `*ResponseSchema` (e.g., `ErrorResponseSchema`)
- Parameter schemas: `*ParamSchema` (e.g., `IdParamSchema`)
- Query schemas: `*QuerySchema` (e.g., `PaginationQuerySchema`)
- Data schemas: `*Schema` (e.g., `UserSchema`, `ProductSchema`)

## Type Safety

All schemas export TypeScript types:

```typescript
import type {
  ErrorResponse,
  NotFoundResponse,
  PaginationMetadata,
} from "@/common/validations";

const error: ErrorResponse = {
  status: 404,
  message: "Not found",
  data: null,
};
```

```

```
