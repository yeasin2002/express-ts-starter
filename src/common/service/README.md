# Common Services

This folder contains reusable service functions that can be shared across multiple API modules.

## Get Users Service

### Overview

The `getUsersService` is a common service function that fetches users from the database with support for:
- **Search**: Search by full name or email (case-insensitive)
- **Filters**: Filter by role, location, and category
- **Pagination**: Page-based pagination with metadata
- **Sorting**: Sort by any field in ascending or descending order

### Usage

```typescript
import { getUsersService } from "@/common/service";

const result = await getUsersService({
  search: "john",
  role: "contractor",
  location: "507f1f77bcf86cd799439011",
  category: "507f1f77bcf86cd799439012",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
});
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | `string` | - | Search by full name or email (case-insensitive) |
| `role` | `"contractor" \| "customer" \| "admin"` | - | Filter by user role |
| `location` | `string` | - | Filter by location ID (MongoDB ObjectId) |
| `category` | `string` | - | Filter by category ID (MongoDB ObjectId) |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `10` | Number of items per page |
| `sortBy` | `string` | `"createdAt"` | Field to sort by |
| `sortOrder` | `"asc" \| "desc"` | `"desc"` | Sort order |

### Response

```typescript
{
  users: UserDocument[],
  pagination: {
    currentPage: number,
    totalPages: number,
    totalUsers: number,
    limit: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}
```

### Example Response

```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "contractor",
      "is_verified": true,
      "category": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Plumbing",
          "icon": "plumbing-icon.png"
        }
      ],
      "location": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "name": "New York",
          "state": "NY"
        }
      ],
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-20T14:45:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 47,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Features

#### 1. Search Functionality
Searches across multiple fields using MongoDB regex:
- Full name (case-insensitive)
- Email address (case-insensitive)

#### 2. Multiple Filters
Supports filtering by:
- **Role**: Filter by user type (contractor, customer, admin)
- **Location**: Filter users by location ID (supports array matching)
- **Category**: Filter users by category ID (supports array matching)

#### 3. Pagination
- Calculates total pages based on total users and limit
- Provides `hasNextPage` and `hasPrevPage` flags
- Efficient skip/limit implementation

#### 4. Sorting
- Sort by any field in the user model
- Supports ascending and descending order
- Default: Sort by `createdAt` in descending order (newest first)

#### 5. Data Population
Automatically populates related data:
- **Category**: Includes name, icon, and description
- **Location**: Includes name, state, and coordinates

#### 6. Security
- Excludes sensitive fields: `password`, `refreshTokens`, `otp`
- Uses `.lean()` for better performance (returns plain JavaScript objects)

### Used By

This service is currently used by:
- **Admin User Module**: `/api/admin/users` - Admin user management
- **Users Module**: `/api/users` - Public user listing

### Adding New Filters

To add a new filter, update the service:

```typescript
// In get-users.service.ts
export interface GetUsersOptions {
  // ... existing options
  newFilter?: string; // Add new filter option
}

export const getUsersService = async (options: GetUsersOptions) => {
  const { newFilter, ...rest } = options;
  
  // Add filter logic
  if (newFilter) {
    filter.newField = newFilter;
  }
  
  // ... rest of the code
};
```

Then update the validation schemas in both modules to include the new filter.

### Performance Considerations

- Uses MongoDB indexes for efficient querying (ensure indexes on frequently queried fields)
- `.lean()` method for faster queries (returns plain objects instead of Mongoose documents)
- Pagination prevents loading all users at once
- Selective field population reduces data transfer

### Best Practices

1. **Always use pagination** - Don't fetch all users at once
2. **Add indexes** - Create indexes on fields used for filtering and sorting
3. **Validate inputs** - Use Zod schemas to validate query parameters
4. **Handle errors** - Wrap service calls in try-catch blocks
5. **Set reasonable limits** - Enforce maximum page size to prevent abuse
