# 📚 API Documentation

> **Complete API reference for the Healthcare Lab Test Booking System.**

<div align="center">
  <img src="https://img.shields.io/badge/API-RESTful-blue.svg?style=for-the-badge" alt="RESTful" />
  <img src="https://img.shields.io/badge/Authentication-JWT-green.svg?style=for-the-badge" alt="JWT" />
  <img src="https://img.shields.io/badge/Documentation-Swagger-orange.svg?style=for-the-badge" alt="Swagger" />
</div>

---

## 🌐 Base URLs

| Environment | Base URL |
|-------------|----------|
| **Local** | http://localhost:8080 |
| **Staging** | https://staging.healthcarelab.com |
| **Production** | https://api.healthcarelab.com |

---

## 🔐 Authentication

All API endpoints (except registration and login) require JWT authentication.

**Header:**
```
Authorization: Bearer {access_token}
```

---

## 📋 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |

### Lab Test Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lab-tests` | Get all tests (paginated) |
| GET | `/api/lab-tests/popular` | Get popular tests |
| GET | `/api/lab-tests/{id}` | Get test by ID |
| GET | `/api/lab-tests/slug/{slug}` | Get test by slug |
| GET | `/api/lab-tests/categories` | Get all categories |
| GET | `/api/lab-tests/advanced` | Advanced search with filters |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/{id}` | Get booking by ID |
| GET | `/api/user-bookings` | Get my bookings |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking |
| PUT | `/api/bookings/{id}/reschedule` | Reschedule booking |
| GET | `/api/bookings/{id}/track` | Track booking status |

### Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/booking/{bookingId}` | Get report by booking |
| POST | `/api/reports/results` | Submit test results |
| GET | `/api/reports/{id}/download` | Download PDF report |
| PUT | `/api/reports/verify` | Verify report (Doctor) |
| GET | `/api/reports/my-reports` | Get my reports |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initiate` | Initiate payment |
| GET | `/api/payments/{id}/status` | Get payment status |
| POST | `/api/payments/refund` | Request refund |

---

## 🔗 Swagger UI

Interactive API documentation available at:
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/api-docs

---

<div align="center">
  <b>For detailed API documentation with examples, visit Swagger UI.</b>
</div>
