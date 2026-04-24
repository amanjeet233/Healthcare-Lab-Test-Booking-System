# API Integration Guide

This guide documents how the HealthLab frontend communicates with the Spring Boot backend.

---

## Architecture Overview

```
Browser → React App → Axios (api.ts) → Spring Boot API (port 8080)
                         ↓
                  axios-retry (3 retries, exponential backoff)
                  withCredentials (session cookies)
                  request/response interceptors
```

---

## Authentication Flow

HealthLab uses **session-based authentication** (not JWT).

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "securePassword123"
}

→ 200 OK (Sets session cookie)
{
  "id": 1,
  "name": "John Doe",
  "email": "patient@example.com",
  "role": "PATIENT"
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "PATIENT",
  "phone": "+919876543210",
  "dateOfBirth": "1995-06-15",
  "gender": "FEMALE"
}

→ 201 Created
```

### Logout
```
POST /api/auth/logout

→ 200 OK (Clears session)
```

---

## Core Endpoints

### Lab Tests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lab-tests` | List all tests (paginated) |
| GET | `/api/lab-tests/{id}` | Get test details |
| GET | `/api/lab-tests/search?query=blood` | Search tests |

**Query Parameters:** `page`, `size`, `sort`, `category`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Complete Blood Count",
      "description": "Measures different components of blood",
      "price": 500.00,
      "category": "Hematology",
      "turnaroundTime": "24 hours"
    }
  ],
  "totalPages": 5,
  "totalElements": 47
}
```

---

### Bookings

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | Patient |
| GET | `/api/bookings/my` | My bookings | Patient |
| GET | `/api/bookings/{id}` | Booking details | Any |
| GET | `/api/bookings` | All bookings | Doctor |
| PUT | `/api/bookings/{id}/status?status=CONFIRMED` | Update status | Doctor |
| PUT | `/api/bookings/{id}/status?status=CANCELLED` | Cancel booking | Doctor/Patient |
| GET | `/api/bookings/technician` | Assigned collections | Technician |
| PUT | `/api/bookings/{id}/status?status=SAMPLE_COLLECTED` | Mark collected | Technician |

**Create Booking Request:**
```json
{
  "testId": 1,
  "bookingDate": "2026-03-15",
  "timeSlot": "09:00-10:00",
  "collectionType": "LAB",
  "address": null,
  "notes": "Fasting required"
}
```

**Booking Status Flow:**
```
PENDING → CONFIRMED → SAMPLE_COLLECTED → COMPLETED
   ↓          ↓
CANCELLED  CANCELLED
```

---

### Doctor-Specific

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mo/pending` | List pending approvals |
| GET | `/api/mo/pending/count` | Count of pending |
| GET | `/api/patients/{id}/bookings` | Patient's booking history |

---

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/change-password` | Change password |
| DELETE | `/api/users/profile` | Delete account |

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "timestamp": "2026-03-07T15:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/bookings"
}
```

| Status Code | Meaning | Frontend Behavior |
|-------------|---------|-------------------|
| 400 | Validation error | Show field-level errors |
| 401 | Not authenticated | Redirect to `/login` |
| 403 | Not authorized | Show "Access Denied" |
| 404 | Not found | Show empty state |
| 500 | Server error | Retry (3x) then show toast |

---

## Adding a New API Service

1. Create `src/services/myService.ts`:

```typescript
import api from './api';

export const myService = {
  getAll: () => api.get('/my-endpoint'),
  getById: (id: number) => api.get(`/my-endpoint/${id}`),
  create: (data: MyType) => api.post('/my-endpoint', data),
};
```

2. Import in your component and call within `useEffect` or form handlers.

---

## CORS Configuration

The backend must allow the frontend origin:

```yaml
# application.yml (Backend)
allowed-origins:
  - http://localhost:5173    # Development
  - https://healthlab.example.com  # Production
```
