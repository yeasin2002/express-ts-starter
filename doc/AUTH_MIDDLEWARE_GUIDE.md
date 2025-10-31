# Authentication Middleware Guide

## Overview

The authentication middleware provides role-based access control for protecting routes in JobSphere. It verifies JWT tokens and checks user roles before allowing access to protected endpoints.

## Available Middleware

### 1. `requireAuth()`

Verifies JWT access token and adds user data to `req.user`.

**Usage:**

```typescript
import { requireAuth } from "@/middleware/auth";

router.get("/profile", requireAuth, getProfile);
```

**What it does:**

- Checks for `Authorization: Bearer <token>` header
- Verifies JWT token
- Adds user data to `req.user`
- Returns 401 if token is missing or invalid

---

### 2. `requireRole(role)`

Checks if authenticated user has a specific role.

**Usage:**

```typescript
import { requireAuth, requireRole } from "@/middleware/auth";

// Customer only
router.post("/bookings", requireAuth, requireRole("customer"), createBooking);

// Contractor only
router.get("/earnings", requireAuth, requireRole("contractor"), getEarnings);

// Admin only
router.delete("/users/:id", requireAuth, requireRole("admin"), deleteUser);
```

**What it does:**

- Requires `requireAuth` to be used first
- Checks if `req.user.role` matches required role
- Returns 403 if role doesn't match

---

### 3. `requireAnyRole(roles)`

Checks if user has any of the specified roles.

**Usage:**

```typescript
import { requireAuth, requireAnyRole } from "@/middleware/auth";

// Allow both customers and contractors
router.get(
  "/messages",
  requireAuth,
  requireAnyRole(["customer", "contractor"]),
  getMessages
);

// Allow contractors and admins
router.get(
  "/analytics",
  requireAuth,
  requireAnyRole(["contractor", "admin"]),
  getAnalytics
);
```

**What it does:**

- Requires `requireAuth` to be used first
- Checks if `req.user.role` is in the allowed roles array
- Returns 403 if role is not in the list

---

### 4. `requireOwnership(userIdParam)`

Checks if user is accessing their own resource or is an admin.

**Usage:**

```typescript
import { requireAuth, requireOwnership } from "@/middleware/auth";

// User can only update their own profile (or admin can update any)
router.put("/users/:id", requireAuth, requireOwnership("id"), updateUser);

// Custom parameter name
router.put(
  "/profiles/:userId",
  requireAuth,
  requireOwnership("userId"),
  updateProfile
);
```

**What it does:**

- Requires `requireAuth` to be used first
- Compares `req.user.userId` with `req.params[userIdParam]`
- Allows access if IDs match OR user is admin
- Returns 403 if user is not owner and not admin

---

### 5. `optionalAuth()`

Adds user data if token is present, but doesn't require authentication.

**Usage:**

```typescript
import { optionalAuth } from "@/middleware/auth";

// Public route with optional auth (e.g., show different content for logged-in users)
router.get("/jobs", optionalAuth, getJobs);
```

**What it does:**

- Checks for token but doesn't fail if missing
- Adds user data to `req.user` if valid token present
- Continues without user data if no token or invalid token
- Never returns error

---

## Request User Object

After `requireAuth` or `optionalAuth`, the user data is available in `req.user`:

```typescript
interface RequestUser {
  userId: string;
  email: string;
  role: "customer" | "contractor" | "admin";
}
```

**Example:**

```typescript
export const getProfile: RequestHandler = async (req, res) => {
  // req.user is available after requireAuth
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  const profile = await db.user.findById(userId);

  res.json({
    status: 200,
    message: "Profile retrieved",
    data: profile,
  });
};
```

---

## Complete Examples

### Example 1: Protected Route (Any Authenticated User)

```typescript
import { requireAuth } from "@/middleware/auth";
import type { RequestHandler } from "express";

export const getMyProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.userId;

    const user = await db.user.findById(userId).select("-password");

    res.status(200).json({
      status: 200,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

// Route
router.get("/me", requireAuth, getMyProfile);
```

---

### Example 2: Role-Specific Route (Admin Only)

```typescript
import { requireAuth, requireRole } from "@/middleware/auth";
import type { RequestHandler } from "express";

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await db.user.findByIdAndDelete(id);

    res.status(200).json({
      status: 200,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

// Route
router.delete("/users/:id", requireAuth, requireRole("admin"), deleteUser);
```

---

### Example 3: Multiple Roles Allowed

```typescript
import { requireAuth, requireAnyRole } from "@/middleware/auth";
import type { RequestHandler } from "express";

export const getMessages: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.userId;

    const messages = await db.message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    res.status(200).json({
      status: 200,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

// Route - Allow both customers and contractors
router.get(
  "/messages",
  requireAuth,
  requireAnyRole(["customer", "contractor"]),
  getMessages
);
```

---

### Example 4: Ownership Check

```typescript
import { requireAuth, requireOwnership } from "@/middleware/auth";
import type { RequestHandler } from "express";

export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // User can only update their own profile (or admin can update any)
    const updatedUser = await db.user.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      status: 200,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

// Route
router.put("/users/:id", requireAuth, requireOwnership("id"), updateProfile);
```

---

### Example 5: Optional Authentication

```typescript
import { optionalAuth } from "@/middleware/auth";
import type { RequestHandler } from "express";

export const getJobs: RequestHandler = async (req, res) => {
  try {
    // Show different content based on authentication
    const query: any = { status: "open" };

    // If user is authenticated, show personalized results
    if (req.user) {
      if (req.user.role === "contractor") {
        // Show jobs matching contractor's skills
        query.category = { $in: req.user.skills };
      }
    }

    const jobs = await db.job.find(query);

    res.status(200).json({
      status: 200,
      message: "Jobs retrieved successfully",
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

// Route - Public but with optional auth
router.get("/jobs", optionalAuth, getJobs);
```

---

## Error Responses

### 401 Unauthorized - No Token

```json
{
  "status": 401,
  "message": "Unauthorized - No token provided",
  "data": null
}
```

### 401 Unauthorized - Invalid Token

```json
{
  "status": 401,
  "message": "Unauthorized - Invalid or expired token",
  "data": null
}
```

### 403 Forbidden - Wrong Role

```json
{
  "status": 403,
  "message": "Forbidden - Admin access required",
  "data": null
}
```

### 403 Forbidden - Not Owner

```json
{
  "status": 403,
  "message": "Forbidden - You can only access your own resources",
  "data": null
}
```

---

## Route Protection Patterns

### Pattern 1: Public Route

```typescript
// No middleware needed
router.get("/categories", getAllCategories);
```

### Pattern 2: Authenticated Users Only

```typescript
router.get("/profile", requireAuth, getProfile);
```

### Pattern 3: Specific Role Only

```typescript
router.post("/categories", requireAuth, requireRole("admin"), createCategory);
```

### Pattern 4: Multiple Roles

```typescript
router.get(
  "/bookings",
  requireAuth,
  requireAnyRole(["customer", "contractor"]),
  getBookings
);
```

### Pattern 5: Owner or Admin

```typescript
router.put("/users/:id", requireAuth, requireOwnership("id"), updateUser);
```

### Pattern 6: Optional Auth

```typescript
router.get("/jobs", optionalAuth, getJobs);
```

---

## Testing with cURL

### Get Access Token

```bash
# Login to get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Response includes accessToken
```

### Use Token in Request

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test Without Token (Should Fail)

```bash
curl -X GET http://localhost:4000/api/auth/me
# Returns 401 Unauthorized
```

### Test Wrong Role (Should Fail)

```bash
# Customer trying to access admin route
curl -X POST http://localhost:4000/api/category \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test category"}'
# Returns 403 Forbidden
```

---

## Mobile App Integration

### Flutter Example

```dart
class ApiClient {
  String? _accessToken;

  void setAccessToken(String token) {
    _accessToken = token;
  }

  Future<Response> get(String endpoint) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }

    return await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
  }

  // Handle 401 errors by refreshing token
  Future<Response> _handleResponse(Response response) async {
    if (response.statusCode == 401) {
      // Token expired, refresh it
      await refreshToken();
      // Retry request
    }
    return response;
  }
}
```

### React/Web Example

```typescript
// API client with token management
const apiClient = {
  accessToken: null as string | null,

  setAccessToken(token: string) {
    this.accessToken = token;
  },

  async get(endpoint: string) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers,
    });

    if (response.status === 401) {
      // Token expired, refresh or redirect to login
      await this.refreshToken();
    }

    return response.json();
  },
};
```

---

## Best Practices

### 1. Always Use requireAuth First

```typescript
// ✅ Good
router.post("/jobs", requireAuth, requireRole("customer"), createJob);

// ❌ Bad - requireRole needs requireAuth first
router.post("/jobs", requireRole("customer"), createJob);
```

### 2. Order Matters

```typescript
// ✅ Good - Auth before validation
router.post(
  "/jobs",
  requireAuth,
  requireRole("customer"),
  validateBody(JobSchema),
  createJob
);

// ❌ Less efficient - Validation before auth
router.post(
  "/jobs",
  validateBody(JobSchema),
  requireAuth,
  requireRole("customer"),
  createJob
);
```

### 3. Use Type Guards

```typescript
// ✅ Good - Type guard for req.user
if (!req.user) {
  return res.status(401).json({ message: "Unauthorized" });
}
const userId = req.user.userId;

// ❌ Bad - Assuming req.user exists
const userId = req.user.userId; // Might be undefined
```

### 4. Handle Token Expiration

```typescript
// Client-side: Refresh token before it expires
setInterval(async () => {
  if (isTokenExpiringSoon()) {
    await refreshAccessToken();
  }
}, 60000); // Check every minute
```

---

## Troubleshooting

### Issue: "req.user is undefined"

**Solution:** Ensure `requireAuth` middleware is used before accessing `req.user`

### Issue: "Cannot read property 'userId' of undefined"

**Solution:** Use non-null assertion or type guard

```typescript
const userId = req.user!.userId; // Non-null assertion
// or
if (req.user) {
  const userId = req.user.userId;
}
```

### Issue: "Token expired"

**Solution:** Implement token refresh logic in your client

### Issue: "403 Forbidden" for admin user

**Solution:** Verify the user's role in the database matches "admin" exactly

---

**Authentication middleware is complete!** 🎉

All routes can now be protected with role-based access control.
