# 🏛️ System Architecture

> **The high-performance, scalable backbone of the Healthcare Lab Ecosystem.**

<div align="center">
  <img src="https://img.shields.io/badge/Architecture-Microservice_Ready-blue.svg?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Scalability-High_Performance-green.svg?style=for-the-badge" alt="Scalability" />
  <img src="https://img.shields.io/badge/Security-Enterprise_Grade-red.svg?style=for-the-badge" alt="Security" />
</div>

---

## 📋 Table of Contents

- [Core Architecture Overview](#-core-architecture-overview)
- [Technology Stack](#-technology-stack)
- [System Architecture Diagram](#-system-architecture-diagram)
- [Data Flow Architecture](#-data-flow-architecture)
- [Booking Lifecycle Flow](#-booking-lifecycle-flow)
- [Authentication & Security](#-authentication--security)
- [Database Schema Design](#-database-schema-design)
- [API Layer Design](#-api-layer-design)
- [Frontend Architecture](#-frontend-architecture)
- [Caching Strategy](#-caching-strategy)
- [Scalability Design](#-scalability-design)
- [Deployment Architecture](#-deployment-architecture)

---

## 🏗️ Core Architecture Overview

Healthcare Lab is structured as a modern **Decoupled Full-Stack Application**, utilizing a high-efficiency Java Spring Boot backend and a lightning-fast React + Vite frontend. The system is designed to handle thousands of concurrent bookings and millions of test records with sub-second response times.

### 🎯 Architecture Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Separation of Concerns** | Clear boundaries between layers | Controller → Service → Repository |
| **Stateless Authentication** | JWT-based, no server-side session | Spring Security + JWT Filter |
| **Data Consistency** | ACID transactions for critical operations | Spring @Transactional |
| **Performance First** | Caching, indexing, query optimization | Redis, Database Indexes, JPQL |
| **Scalability** | Horizontal scaling ready | Stateless design, Docker support |

---

## 🛠️ Technology Stack

### 🍃 Backend (The Engine)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Spring Boot | 3.3.x | Application framework |
| **Language** | Java | 21 LTS | Core programming language |
| **ORM** | Hibernate / Spring Data JPA | 3.3.x | Database abstraction |
| **Security** | Spring Security + JWT | 6.2.x | Authentication & authorization |
| **Database** | MySQL | 8.0+ | Primary data store |
| **Caching** | Redis | 7.0+ | In-memory caching layer |
| **Build Tool** | Maven | 3.9+ | Dependency management |
| **API Docs** | SpringDoc OpenAPI | 2.3.0 | Interactive documentation |

**Key Backend Features:**
- ✅ Intelligent database seeding (500+ lab tests)
- ✅ Role-based access control (RBAC)
- ✅ Audit logging for all critical operations
- ✅ Exception handling with global error handler
- ✅ Validation with Bean Validation API

---

### ⚛️ Frontend (The Experience)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 19 | UI framework |
| **Build Tool** | Vite | 5.x | Fast development & build |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **Animations** | Framer Motion | 11.x | Smooth UI transitions |
| **State Management** | React Context + Hooks | - | Global state |
| **HTTP Client** | Axios | 1.x | API communication |
| **Forms** | React Hook Form | 7.x | Form management |
| **Virtualization** | React Window | 1.x | Large list performance |

**Key Frontend Features:**
- ✅ Premium Dark/Light mode with Tailwind
- ✅ Glassmorphism UI design
- ✅ Virtual scrolling for 1000+ items
- ✅ Real-time status updates
- ✅ Responsive design (mobile-first)

---

### 🗄️ Database (The Memory)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Primary DB** | MySQL | 8.0+ | Relational data storage |
| **Caching Layer** | Redis | 7.0+ | Session & result caching |
| **Connection Pool** | HikariCP | 5.1.0 | Database connection pooling |
| **Migration** | Flyway | 9.x | Database version control |

**Database Features:**
- ✅ 31 optimized indexes across 16 tables
- ✅ Foreign key constraints for data integrity
- ✅ Soft delete support
- ✅ Audit timestamps (created_at, updated_at)
- ✅ Query optimization with JPQL

---

## 🏗️ System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Patient Web App]
        B[Technician Mobile App]
        C[Admin Dashboard]
    end

    subgraph "API Gateway / Load Balancer"
        D[NGINX / AWS ALB]
    end

    subgraph "Backend Services"
        E[Spring Boot Application]
        F[Auth Service]
        G[Booking Service]
        H[Lab Test Service]
        I[Report Service]
        J[Payment Service]
    end

    subgraph "Data Layer"
        K[(MySQL Database)]
        L[(Redis Cache)]
    end

    subgraph "External Services"
        M[Email Service - SMTP]
        N[SMS Gateway - Twilio]
        O[Payment Gateway - Razorpay]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    F --> L
    G --> L
    H --> L
    E --> M
    E --> N
    E --> O

    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style E fill:#9C27B0
    style K fill:#F44336
    style L fill:#FF5722
```

---

## 🔒 Authentication & Security

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as Auth API
    participant S as Spring Security
    participant JWT as JWT Provider
    participant DB as Database

    U->>C: Enter Credentials
    C->>A: POST /api/auth/login
    A->>DB: Validate User
    DB-->>A: User Found
    A->>JWT: Generate Token
    JWT-->>A: JWT Token
    A-->>C: Token + User Info
    C->>C: Store Token (localStorage)

    Note over C,DB: Subsequent Requests

    C->>S: API Request + Bearer Token
    S->>JWT: Validate Token
    JWT-->>S: User Claims
    S->>S: Set Security Context
    S->>A: Process Request
    A-->>C: Response
```

### Security Layers

```mermaid
graph TB
    subgraph "Security Layers"
        A[Network Layer - TLS/SSL]
        B[API Gateway - Rate Limiting]
        C[Authentication - JWT]
        D[Authorization - RBAC]
        E[Application - Input Validation]
        F[Database - Encrypted Passwords]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style E fill:#F44336
    style F fill:#FF5722
```

**Security Measures:**

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **Network** | TLS 1.3 | Encrypt data in transit |
| **API Gateway** | Rate Limiting (100-1000 req/min) | Prevent DDoS attacks |
| **Authentication** | JWT + BCrypt (strength: 10) | Secure identity verification |
| **Authorization** | @PreAuthorize annotations | Role-based access control |
| **Input Validation** | Bean Validation + Custom Validators | Prevent injection attacks |
| **Database** | Encrypted passwords, SQL parameterization | Protect stored data |
| **Audit Logging** | AuditListener | Track all critical operations |

---

## 👨‍💻 Strategic Oversight

- **Chief Architect:** AMANJEET KUMAR
- **Mission:** High availability, zero latency, and beautiful healthcare logic
- **Contact:** Instagram [@amanjeet233](https://instagram.com/amanjeet233)

---

<div align="center">
  <i>"Architecture is the foundation of trust in healthcare software."</i><br/>
  <b>Built with precision for modern healthcare infrastructure.</b>
</div>
