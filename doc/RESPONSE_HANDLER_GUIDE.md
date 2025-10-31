# Response Handler Guide

## Overview

The response handler provides a consistent way to send API responses across your application. It ensures all responses follow the same structure and makes your code cleaner and more maintainable.

## Response Structure

### Success Response

```json
{
  "status": 200,
  "message": "Success message",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "status": 400,
  "message": "Error message",
  "data": null,
  "errors": [
    {
      "path": "field.name",
      "message": "Validation error"
    }
  ]
}
```

## Usage Methods

### 1. Function-Based Approach (Recommended)

Import individual functions for specific use cases:

```typescript
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendInternalError,
} from "@/helpers/response-handler";
```

#### Success Responses

**Generic Success (200)**

```typescript
export const getUsers: RequestHandler = async (req, res) => {
  const users = await db.user.find();
  return sendSuccess(res, 200, "Users retrieved successfully", users);
};
```

**Created (201)**

```typescript
export const createUser: RequestHandler = async (req, res) => {
  const user = await db.user.create(req.body);
  return sendCreated(res, "User created successfully", user);
};
```

**Custom Status Code**

```typescript
export const updateUser: RequestHandler = async (req, res) => {
  const user = await db.user.findByIdAndUpdate(req.params.id, req.body);
  return sendSuccess(res, 200, "User updated successfully", user);
};
```

#### Error Responses

**Bad Request (400)**

```typescript
export const createUser: RequestHandler = async (req, res) => {
  const existingUser = await db.user.findOne({ email: req.body.email });
  if (existingUser) {
    return sendBadRequest(res, "User with this email already exists");
  }
  // ... continue
};
```

**Bad Request with Validation Errors**

```typescript
return sendBadRequest(res, "Validation failed", [
  { path: "email", message: "Invalid email format" },
  { path: "password", message: "Password too short" },
]);
```

**Unauthorized (401)**

```typescript
export const login: RequestHandler = async (req, res) => {
  const user = await db.user.findOne({ email: req.body.email });
  if (!user) {
    return sendUnauthorized(res, "Invalid credentials");
  }
  // ... continue
};
```

**Forbidden (403)**

```typescript
export const deleteUser: RequestHandler = async (req, res) => {
  if (req.user.role !== "admin") {
    return sendForbidden(res, "Only admins can delete users");
  }
  // ... continue
};
```

**Not Found (404)**

```typescript
export const getUser: RequestHandler = async (req, res) => {
  const user = await db.user.findById(req.params.id);
  if (!user) {
    return sendNotFound(res, "User not found");
  }
  return sendSuccess(res, 200, "User retrieved successfully", user);
};
```

**Internal Server Error (500)**

```typescript
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await db.user.find();
    return sendSuccess(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    console.error("Get users error:", error);
    return sendInternalError(res, "Failed to retrieve users");
  }
};
```

### 2. Class-Based Approach (Alternative)

Use the ResponseHandler class for chaining:

```typescript
import { createResponseHandler } from "@/helpers/response-handler";

export const getUsers: RequestHandler = async (req, res) => {
  const handler = createResponseHandler(res);

  try {
    const users = await db.user.find();
    return handler.success(200, "Users retrieved successfully", users);
  } catch (error) {
    return handler.internalError("Failed to retrieve users");
  }
};
```

## Complete Examples

### Example 1: User Registration

```typescript
import {
  sendCreated,
  sendBadRequest,
  sendInternalError,
} from "@/helpers/response-handler";
import { hashPassword, signAccessToken, signRefreshToken } from "@/lib/jwt";
import type { RequestHandler } from "express";

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await db.user.findOne({ email });
    if (existingUser) {
      return sendBadRequest(res, "User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user._id,
      email: user.email,
    });
    const { token: refreshToken } = signRefreshToken({
      userId: user._id,
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return sendCreated(res, "User registered successfully", {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    return sendInternalError(res);
  }
};
```

### Example 2: Get User by ID

```typescript
import {
  sendSuccess,
  sendNotFound,
  sendInternalError,
} from "@/helpers/response-handler";
import type { RequestHandler } from "express";

export const getUser: RequestHandler = async (req, res) => {
  try {
    const user = await db.user.findById(req.params.id).select("-password");

    if (!user) {
      return sendNotFound(res, "User not found");
    }

    return sendSuccess(res, 200, "User retrieved successfully", user);
  } catch (error) {
    console.error("Get user error:", error);
    return sendInternalError(res);
  }
};
```

### Example 3: Update User with Authorization

```typescript
import {
  sendSuccess,
  sendNotFound,
  sendForbidden,
  sendInternalError,
} from "@/helpers/response-handler";
import type { RequestHandler } from "express";

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = (req as any).user;

    // Check if user can update this profile
    if (currentUser.userId !== userId && currentUser.role !== "admin") {
      return sendForbidden(res, "You can only update your own profile");
    }

    const user = await db.user
      .findByIdAndUpdate(userId, req.body, { new: true })
      .select("-password");

    if (!user) {
      return sendNotFound(res, "User not found");
    }

    return sendSuccess(res, 200, "User updated successfully", user);
  } catch (error) {
    console.error("Update user error:", error);
    return sendInternalError(res);
  }
};
```

### Example 4: Delete User

```typescript
import {
  sendSuccess,
  sendNotFound,
  sendForbidden,
  sendInternalError,
} from "@/helpers/response-handler";
import type { RequestHandler } from "express";

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const currentUser = (req as any).user;

    // Only admins can delete users
    if (currentUser.role !== "admin") {
      return sendForbidden(res, "Only admins can delete users");
    }

    const user = await db.user.findByIdAndDelete(req.params.id);

    if (!user) {
      return sendNotFound(res, "User not found");
    }

    return sendSuccess(res, 200, "User deleted successfully", null);
  } catch (error) {
    console.error("Delete user error:", error);
    return sendInternalError(res);
  }
};
```

## Available Functions

| Function                                | Status Code | Description                    |
| --------------------------------------- | ----------- | ------------------------------ |
| `sendSuccess(res, code, message, data)` | Custom      | Generic success response       |
| `sendCreated(res, message, data)`       | 201         | Resource created               |
| `sendNoContent(res)`                    | 204         | No content to return           |
| `sendError(res, code, message, errors)` | Custom      | Generic error response         |
| `sendBadRequest(res, message, errors)`  | 400         | Bad request / validation error |
| `sendUnauthorized(res, message)`        | 401         | Authentication required        |
| `sendForbidden(res, message)`           | 403         | Insufficient permissions       |
| `sendNotFound(res, message)`            | 404         | Resource not found             |
| `sendInternalError(res, message)`       | 500         | Server error                   |

## TypeScript Support

All functions are fully typed with generics:

```typescript
// Type-safe data response
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = await db.user.findById(id);
return sendSuccess<User>(res, 200, "User found", user);

// Type-safe array response
const users: User[] = await db.user.find();
return sendSuccess<User[]>(res, 200, "Users found", users);

// Null data
return sendSuccess(res, 200, "Operation completed", null);
```

## Best Practices

### 1. Always Return the Response

```typescript
// ✅ Good
return sendSuccess(res, 200, "Success", data);

// ❌ Bad - might cause "headers already sent" error
sendSuccess(res, 200, "Success", data);
// ... more code
```

### 2. Use Specific Error Functions

```typescript
// ✅ Good
return sendNotFound(res, "User not found");

// ❌ Less clear
return sendError(res, 404, "User not found");
```

### 3. Provide Meaningful Messages

```typescript
// ✅ Good
return sendBadRequest(res, "Email is already registered");

// ❌ Too generic
return sendBadRequest(res, "Bad request");
```

### 4. Include Validation Errors

```typescript
// ✅ Good
return sendBadRequest(res, "Validation failed", [
  { path: "email", message: "Invalid email format" },
  { path: "password", message: "Password must be at least 6 characters" },
]);

// ❌ Missing details
return sendBadRequest(res, "Validation failed");
```

### 5. Handle Errors Consistently

```typescript
// ✅ Good
try {
  // ... operation
  return sendSuccess(res, 200, "Success", data);
} catch (error) {
  console.error("Operation error:", error);
  return sendInternalError(res, "Operation failed");
}

// ❌ Inconsistent
try {
  // ... operation
  res.json({ success: true, data });
} catch (error) {
  res.status(500).json({ error: "Failed" });
}
```

## Migration Guide

### Before (Manual Response)

```typescript
export const getUser: RequestHandler = async (req, res) => {
  try {
    const user = await db.user.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};
```

### After (With Response Handler)

```typescript
import {
  sendSuccess,
  sendNotFound,
  sendInternalError,
} from "@/helpers/response-handler";

export const getUser: RequestHandler = async (req, res) => {
  try {
    const user = await db.user.findById(req.params.id);

    if (!user) {
      return sendNotFound(res, "User not found");
    }

    return sendSuccess(res, 200, "User retrieved successfully", user);
  } catch (error) {
    return sendInternalError(res);
  }
};
```

## Benefits

1. ✅ **Consistency** - All responses follow the same structure
2. ✅ **Type Safety** - Full TypeScript support with generics
3. ✅ **Less Code** - Shorter, cleaner handlers
4. ✅ **Maintainability** - Easy to update response format globally
5. ✅ **Readability** - Clear intent with named functions
6. ✅ **Error Handling** - Standardized error responses
7. ✅ **Documentation** - Self-documenting code

---

Use the response handler in all your route handlers for consistent, clean, and maintainable code! 🎉
