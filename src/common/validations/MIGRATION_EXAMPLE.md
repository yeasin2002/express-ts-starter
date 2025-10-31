# Migration Example: Using Common Validations

This document shows how to migrate an existing module to use common validation schemas.

## Example Module: Product API

### BEFORE: Duplicated Schemas

```typescript
// src/api/product/product.validation.ts (BEFORE)
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Product schema
export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).openapi("Product");

// Create product schema
export const CreateProductSchema = ProductSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).openapi("CreateProduct");

// Update product schema
export const UpdateProductSchema = ProductSchema.partial().openapi("UpdateProduct");

// ID parameter schema - DUPLICATED!
export const ProductIdSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
}).openapi("ProductIdParam");

// Query schema - DUPLICATED!
export const ProductQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
}).openapi("ProductQuery");

// Response schemas - ALL DUPLICATED!
export const ProductResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: ProductSchema.nullable(),
}).openapi("ProductResponse");

export const ProductsResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    products: z.array(ProductSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
}).openapi("ProductsResponse");

export const SuccessResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null(),
}).openapi("SuccessResponse");

export const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null(),
}).openapi("ErrorResponse");

// Type exports
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
```

### AFTER: Using Common Schemas

```typescript
// src/api/product/product.validation.ts (AFTER)
import {
  ErrorResponseSchema,
  InternalServerErrorResponseSchema,
  NotFoundResponseSchema,
  BadRequestResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
  SearchWithPaginationQuerySchema,
  SimplePaginationSchema,
} from "@/common/validations";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// ============================================
// Product-Specific Schemas Only
// ============================================

// Product schema
export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).openapi("Product");

// Create product schema
export const CreateProductSchema = ProductSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).openapi("CreateProduct");

// Update product schema
export const UpdateProductSchema = ProductSchema.partial().openapi("UpdateProduct");

// ============================================
// Reuse Common Schemas
// ============================================

// ID parameter - REUSED!
export const ProductIdParamSchema = IdParamSchema;

// Query schema - REUSED with extension!
export const ProductQuerySchema = SearchWithPaginationQuery
```
