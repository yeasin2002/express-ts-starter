# Job Module Guide

## Overview

The Job module provides CRUD operations for managing job postings in JobSphere. Customers can post jobs, and contractors can view and apply for them.

## Features

- ✅ **Public Access**: Anyone can view and search jobs
- ✅ **Customer Only**: Create jobs (authenticated customers)
- ✅ **Owner/Admin**: Update and delete jobs
- ✅ **Search & Filter**: Search by title, category, location, budget, status
- ✅ **Pagination**: Paginated results with search/filter support
- ✅ **Application Status**: Contractors see `isApplied` field indicating if they've applied
- ✅ **Validation**: Full input validation with Zod
- ✅ **OpenAPI**: Complete API documentation

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/job` | Public | Get all jobs with search/filters |
| GET | `/api/job/:id` | Public | Get job by ID |
| GET | `/api/job/my/jobs` | Customer | Get customer's own jobs |
| POST | `/api/job` | Customer | Create new job |
| PUT | `/api/job/:id` | Owner/Admin | Update job |
| DELETE | `/api/job/:id` | Owner/Admin | Delete job |

## Data Model

```typescript
interface Job {
  _id: string;
  title: string;
  category: string[];        // Array of category IDs
  description: string;
  location: string;
  address: string;
  budget: number;
  date: Date;
  coverImg: string;          // Cover image URL
  customerId: string;        // User who posted the job
  contractorId?: string;     // Assigned contractor (optional)
  status: "open" | "in_progress" | "completed" | "cancelled";
  isApplied?: boolean;       // True if authenticated contractor has applied (contractors only)
  createdAt: Date;
  updatedAt: Date;
}
```

## API Usage

### 1. Get All Jobs

**Endpoint:** `GET /api/job`

**Query Parameters:**
- `search` (optional): Search in title or description
- `category` (optional): Filter by category ID
- `status` (optional): Filter by status
- `minBudget` (optional): Minimum budget
- `maxBudget` (optional): Maximum budget
- `location` (optional): Filter by location ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Special Features:**
- If authenticated as a **contractor**, each job includes an `isApplied` field (boolean) indicating whether you've already applied to that job
- For non-contractors or unauthenticated users, `isApplied` is always `false`

**Examples:**

```bash
# Get all jobs
GET /api/job

# Search jobs
GET /api/job?search=plumbing

# Filter by category
GET /api/job?category=507f1f77bcf86cd799439011

# Filter by status
GET /api/job?status=open

# Filter by budget range
GET /api/job?minBudget=100&maxBudget=500

# Filter by location
GET /api/job?location=New York

# Combined filters with pagination
GET /api/job?search=repair&category=507f&status=open&page=1&limit=20
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Fix Kitchen Sink",
        "category": [
          {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Plumbing",
            "icon": "/uploads/plumbing-icon.png"
          }
        ],
        "description": "Need a plumber to fix leaking kitchen sink",
        "location": "New York, NY",
        "budget": 150,
        "date": "2025-01-25T10:00:00.000Z",
        "coverImg": "https://example.com/image.jpg",
        "customerId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "contractorId": null,
        "status": "open",
        "isApplied": false,
        "createdAt": "2025-01-18T10:00:00.000Z",
        "updatedAt": "2025-01-18T10:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Note for Contractors:**
If you're authenticated as a contractor, the `isApplied` field will be `true` for jobs you've already applied to:

```json
{
  "status": 200,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Fix Kitchen Sink",
        ...
        "isApplied": true,  // ← You've already applied to this job
        ...
      },
      {
        "_id": "507f1f77bcf86cd799439022",
        "title": "Electrical Repair",
        ...
        "isApplied": false,  // ← You haven't applied yet
        ...
      }
    ],
    ...
  }
}
```

---

### 2. Get Job by ID

**Endpoint:** `GET /api/job/:id`

**Example:**
```bash
GET /api/job/507f1f77bcf86cd799439011
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Job retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Fix Kitchen Sink",
    "category": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Plumbing",
        "icon": "/uploads/plumbing-icon.png",
        "description": "Professional plumbing services"
      }
    ],
    "description": "Need a plumber to fix leaking kitchen sink. The leak is under the sink and water is dripping constantly.",
    "location": "New York, NY",
    "budget": 150,
    "date": "2025-01-25T10:00:00.000Z",
    "coverImg": "https://example.com/image.jpg",
    "customerId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "contractorId": null,
    "status": "open",
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  }
}
```

---

### 3. Get My Jobs (Customer's Own Jobs)

**Endpoint:** `GET /api/job/my/jobs`

**Headers:**
```
Authorization: Bearer <customer_access_token>
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Your jobs retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Fix Kitchen Sink",
      "category": [...],
      "description": "...",
      "status": "open",
      ...
    }
  ]
}
```

---

### 4. Create Job (Customer Only)

**Endpoint:** `POST /api/job`

**Headers:**
```
Authorization: Bearer <customer_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Fix Kitchen Sink",
  "category": ["507f1f77bcf86cd799439012"],
  "description": "Need a plumber to fix leaking kitchen sink. The leak is under the sink and water is dripping constantly.",
  "location": "New York, NY",
  "budget": 150,
  "date": "2025-01-25T10:00:00.000Z",
  "coverImg": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Job created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Fix Kitchen Sink",
    "category": [...],
    "description": "...",
    "location": "New York, NY",
    "budget": 150,
    "date": "2025-01-25T10:00:00.000Z",
    "coverImg": "https://example.com/image.jpg",
    "customerId": "507f1f77bcf86cd799439013",
    "status": "open",
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  }
}
```

---

### 5. Update Job (Owner or Admin)

**Endpoint:** `PUT /api/job/:id`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "title": "Fix Kitchen Sink - Urgent",
  "budget": 200,
  "status": "in_progress"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Job updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Fix Kitchen Sink - Urgent",
    "budget": 200,
    "status": "in_progress",
    ...
  }
}
```

---

### 6. Delete Job (Owner or Admin)

**Endpoint:** `DELETE /api/job/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Job deleted successfully",
  "data": null
}
```

---

## Validation Rules

### Create Job

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | Min 5 characters |
| category | array | Yes | Min 1 category ID |
| description | string | Yes | Min 20 characters |
| location | string | Yes | Min 3 characters |
| budget | number | Yes | Must be positive |
| date | string/date | Yes | Valid date |
| coverImg | string | Yes | Valid URL |

### Update Job

All fields optional, same validation rules apply when provided.

---

## Access Control

### Public Routes
- GET `/api/job` - Anyone can view jobs
- GET `/api/job/:id` - Anyone can view job details

### Customer Routes
- GET `/api/job/my/jobs` - Customer only
- POST `/api/job` - Customer only

### Owner/Admin Routes
- PUT `/api/job/:id` - Owner or Admin
- DELETE `/api/job/:id` - Owner or Admin

---

## Error Responses

### 400 Bad Request
```json
{
  "status": 400,
  "message": "One or more categories not found",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "message": "Unauthorized - No token provided",
  "data": null
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "message": "Forbidden - You can only update your own jobs",
  "data": null
}
```

### 404 Not Found
```json
{
  "status": 404,
  "message": "Job not found",
  "data": null
}
```

---

## Mobile App Integration

### Flutter Example

```dart
class JobService {
  final ApiClient _api;
  
  // Get all jobs with filters
  Future<JobsResponse> getJobs({
    String? search,
    String? category,
    String? status,
    int? minBudget,
    int? maxBudget,
    String? location,
    int page = 1,
    int limit = 10,
  }) async {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    
    if (search != null) params['search'] = search;
    if (category != null) params['category'] = category;
    if (status != null) params['status'] = status;
    if (minBudget != null) params['minBudget'] = minBudget.toString();
    if (maxBudget != null) params['maxBudget'] = maxBudget.toString();
    if (location != null) params['location'] = location;
    
    final response = await _api.get('/job', queryParams: params);
    return JobsResponse.fromJson(response.data);
  }
  
  // Create job (Customer only)
  Future<Job> createJob(CreateJobDto dto) async {
    final response = await _api.post('/job', dto.toJson());
    return Job.fromJson(response.data);
  }
  
  // Get my jobs
  Future<List<Job>> getMyJobs() async {
    final response = await _api.get('/job/my/jobs');
    return (response.data as List)
        .map((json) => Job.fromJson(json))
        .toList();
  }
}
```

---

## Testing

### Test Sequence

1. **Login as Customer**
   ```bash
   POST /api/auth/login
   ```

2. **Create Job**
   ```bash
   POST /api/job
   Authorization: Bearer <customer_token>
   ```

3. **Get All Jobs**
   ```bash
   GET /api/job
   ```

4. **Search Jobs**
   ```bash
   GET /api/job?search=plumbing&status=open
   ```

5. **Get My Jobs**
   ```bash
   GET /api/job/my/jobs
   Authorization: Bearer <customer_token>
   ```

6. **Update Job**
   ```bash
   PUT /api/job/:id
   Authorization: Bearer <customer_token>
   ```

7. **Delete Job**
   ```bash
   DELETE /api/job/:id
   Authorization: Bearer <customer_token>
   ```

---

**Job module is complete!** 🎉

Basic CRUD operations are implemented with search, filters, and role-based access control.
