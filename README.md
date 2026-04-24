<div align="center">
  <h1>🏥 Healthcare Lab Test Booking System</h1>
  <p><b>A modern, full-stack healthcare platform for lab test bookings, diagnostics, and report management.</b></p>


![Java](https://img.shields.io/badge/Java-21-orange.svg?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen.svg?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=for-the-badge&logo=mysql)
![Redis](https://img.shields.io/badge/Redis-7.0-red.svg?style=for-the-badge&logo=redis)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

[![GitHub stars](https://img.shields.io/github/stars/amanjeet233/HEALTHCARELAB?style=for-the-badge&logo=github)](https://github.com/amanjeet233/HEALTHCARELAB)
[![GitHub forks](https://img.shields.io/github/forks/amanjeet233/HEALTHCARELAB?style=for-the-badge&logo=github)](https://github.com/amanjeet233/HEALTHCARELAB/fork)
[![GitHub issues](https://img.shields.io/github/issues/amanjeet233/HEALTHCARELAB?style=for-the-badge&logo=github)](https://github.com/amanjeet233/HEALTHCARELAB/issues)
[![GitHub contributors](https://img.shields.io/github/contributors/amanjeet233/HEALTHCARELAB?style=for-the-badge&logo=github)](https://github.com/amanjeet233/HEALTHCARELAB/graphs/contributors)

**[📖 Documentation](docs/) • [🚀 Getting Started](#-getting-started) • [📚 API Reference](docs/api/API.md) • [🐛 Report Issue](https://github.com/amanjeet233/HEALTHCARELAB/issues)**

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🎯 Core Features](#-core-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [📁 Project Structure](#-project-structure)
- [📊 Architecture](#-architecture)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👤 Author](#-author)

---

## 🌟 Overview

Healthcare Lab Test Booking System is a comprehensive healthcare platform designed to streamline the process of booking lab tests, managing appointments, and delivering diagnostic reports. Built with modern technologies, it provides a seamless experience for patients, technicians, and medical officers.

### 🎯 Key Highlights

- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control (RBAC)
- 📅 **Smart Booking System** - Intelligent slot management and appointment scheduling
- 📋 **Comprehensive Test Catalog** - 100+ lab tests across 15 medical categories
- 📊 **Real-time Tracking** - Track bookings from sample collection to report delivery
- 💳 **Integrated Payments** - Multiple payment methods with secure processing (Razorpay/Stripe)
- 📱 **Responsive Design** - Mobile-first design with dark/light mode support
- 🧪 **Diagnostic Reports** - PDF report generation with abnormality detection
- 📈 **Analytics Dashboard** - Comprehensive analytics for administrators
- ⚡ **High Performance** - Redis caching, database indexing, optimized queries
- 🌐 **Microservice Ready** - Modular architecture for easy scaling

---

## 📸 Preview & Screenshots
 
<div align="center">
  <h3>✨ The Modern Patient Experience</h3>
  <img src="https://github.com/user-attachments/assets/55625d16-b2b0-4e8d-a2b7-0c77fc2000db" alt="Healthcare Lab Landing Page" width="900" style="border-radius: 10px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);" />
  <br/><br/>
  <h3>📋 Clinical Oversight (MO Dashboard)</h3>
  <img src="https://github.com/user-attachments/assets/0a92588d-8376-4a13-8372-c62e49b08325" alt="Medical Officer Dashboard" width="900" style="border-radius: 10px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);" />
  <br/><br/>
  <h3>🛡️ Enterprise Governance (Admin Dashboard)</h3>
  <img src="https://github.com/user-attachments/assets/492d3e75-fc9e-4264-9289-33470ca81eb8" width="900" style="border-radius: 10px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);" />
  <br/><br/>
  <h3>🔬 Operations Management (Technician Dashboard)</h3>
  <img src="https://github.com/user-attachments/assets/42494be1-a17d-468e-98be-f3c0d807f616" alt="Technician Dashboard" width="900" style="border-radius: 10px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);" />
  <br/>
  <i>Efficient Task Management, Priority Queues, and real-time status updates for Sample Collection.</i>
</div>

---

## 🎯 Core Features


### 👤 For Patients

| Feature | Description |
| :--- | :--- |
| 🏠 **Home Collection** | Book sample collection from home with real-time technician tracking |
| 🔍 **Test Search** | Advanced search with filters by category, price, and name |
| 📊 **Report Access** | Download reports in PDF format with historical trends |
| 💳 **Easy Payments** | Multiple payment options (UPI, Card, Net Banking) |
| 📱 **Mobile Friendly** | Works seamlessly on all devices with responsive design |
| 🔔 **Notifications** | Email/SMS notifications for booking updates |
| 💰 **Discounts** | Automatic discounts on health packages |

### 🔬 For Technicians

| Feature | Description |
| :--- | :--- |
| 📍 **Location Tracking** | Real-time GPS synchronization for efficient home sample collection routing |
| 📋 **Assignment Management** | Automated queue management for pending and completed sample collections |
| ✅ **Result Submission** | Secure API-driven entry for lab results with multi-parameter validation |
| 📊 **Status Updates** | Instant status transitions (Collected, In-Transit, Lab-Received) via mobile interface |
| 🗺️ **Route Optimization** | Intelligent route planning to minimize travel time between collection points |

### 👨‍⚕️ For Medical Officers

| Feature | Description |
| :--- | :--- |
| ✅ **Report Verification** | Digital counter-signing of diagnostic reports with timestamped approvals |
| 🔍 **Quality Control** | Automated cross-referencing of results against standard reference ranges |
| 📊 **Patient History** | Comparative view of historical test results for longitudinal monitoring |
| 💬 **Comments & Notes** | Clinical observation logging with support for professional annotations |
| ⚠️ **Critical Alerts** | Real-time system notifications for life-threatening test value abnormalities |

### 👨‍💼 For Administrators

| Feature | Description |
| :--- | :--- |
| 📊 **Dashboard Analytics** | Executive overview of booking volumes, revenue, and operational KPIs |
| 👥 **User Management** | Granular control over user roles, permissions, and account management |
| 🧪 **Test Management** | Dynamic catalog controller for medical tests, pricing, and parameters |
| 💰 **Revenue Tracking** | Detailed financial reporting with support for multi-channel audits |
| 📈 **Trend Analysis** | Predictive modeling of peak booking times and high-demand packages |
| 🔧 **System Configuration** | Global platform settings management for API keys and system gateways |

---

## 🛠️ Tech Stack

### 🍃 Backend

| Technology | Version | Purpose | Link |
| :--- | :--- | :--- | :--- |
| **Java** | 21 LTS | Core programming language | [OpenJDK](https://openjdk.org/projects/jdk/21/) |
| **Spring Boot** | 3.2.2 | Application framework | [Spring Boot](https://spring.io/projects/spring-boot) |
| **Spring Security** | 6.2.x | Security & authentication | [Spring Security](https://spring.io/projects/spring-security) |
| **Spring Data JPA** | 3.2.x | Database abstraction | [Spring Data JPA](https://spring.io/projects/spring-data-jpa) |
| **Hibernate** | 6.4.x | ORM framework | [Hibernate](https://hibernate.org/) |
| **MySQL** | 8.0+ | Primary database | [MySQL](https://www.mysql.com/) |
| **Redis** | 7.0+ | Caching layer | [Redis](https://redis.io/) |
| **Flyway** | 9.x | Database migrations | [Flyway](https://flywaydb.org/) |
| **Maven** | 3.9+ | Build tool | [Maven](https://maven.apache.org/) |
| **SpringDoc OpenAPI** | 2.3.0 | API documentation | [SpringDoc](https://springdoc.org/) |

### ⚛️ Frontend

| Technology | Version | Purpose | Link |
| :--- | :--- | :--- | :--- |
| **React** | 19 | UI framework | [React](https://react.dev/) |
| **Vite** | 5.x | Build tool | [Vite](https://vitejs.dev/) |
| **TypeScript** | 5.x | Type-safe JavaScript | [TypeScript](https://www.typescriptlang.org/) |
| **Tailwind CSS** | v4 | Styling | [Tailwind CSS](https://tailwindcss.com/) |
| **Framer Motion** | 11.x | Animations | [Framer Motion](https://www.framer.com/motion/) |
| **Axios** | 1.x | HTTP client | [Axios](https://axios-http.com/) |
| **React Router** | 6.x | Routing | [React Router](https://reactrouter.com/) |
| **React Hook Form** | 7.x | Form management | [React Hook Form](https://react-hook-form.com/) |

### 🚀 DevOps & Testing

| Technology | Purpose | Link |
| :--- | :--- | :--- |
| **Docker** | Containerization | [Docker](https://www.docker.com/) |
| **GitHub Actions** | CI/CD | [GitHub Actions](https://github.com/features/actions) |
| **Playwright** | E2E testing | [Playwright](https://playwright.dev/) |
| **Postman** | API testing | [Postman](https://www.postman.com/) |
| **JMeter** | Load testing | [JMeter](https://jmeter.apache.org/) |
| **Prometheus** | Monitoring | [Prometheus](https://prometheus.io/) |
| **Grafana** | Visualization | [Grafana](https://grafana.com/) |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Minimum Version | Recommended | Download |
| :--- | :--- | :--- | :--- |
| **Java JDK** | 17 | 21 LTS | [OpenJDK](https://openjdk.org/projects/jdk/21/) |
| **Maven** | 3.8+ | 3.9+ | [Maven](https://maven.apache.org/download.cgi) |
| **Node.js** | 18+ | 20 LTS | [Node.js](https://nodejs.org/) |
| **MySQL** | 8.0+ | 8.0+ | [MySQL](https://dev.mysql.com/downloads/) |
| **Git** | Latest | Latest | [Git](https://git-scm.com/downloads) |

### 💻 System Requirements

- **RAM:** Minimum 4 GB, Recommended 8 GB+
- **Storage:** 2 GB free space
- **OS:** Windows 10+, macOS 10.15+, Ubuntu 20.04+

---

## 🚀 Getting Started

### ⚡ Quick Start (Windows)

```bash
# Clone the repository
git clone https://github.com/amanjeet233/HEALTHCARELAB.git
cd HEALTHCARELAB

# Run the startup script
startup.bat
```

This will automatically start both the backend and frontend servers.

### 🔧 Manual Setup

#### 1️⃣ Database Setup

Create a MySQL database:

```sql
mysql -u root -p
CREATE DATABASE healthcarelab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'labuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON healthcarelab.* TO 'labuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2️⃣ Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on **http://localhost:8080**

#### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

### 👥 Default Test Credentials

> **Use these pre-configured accounts to explore different roles within the platform.**

| Role | Email | Password | Primary Workflow |
| :--- | :--- | :--- | :--- |
| **🛡️ Administrator** | `admin@test.com` | `password123` | Control Panel, User & Test Management |
| **👨‍⚕️ Medical Officer** | `doctor@test.com` | `password123` | Report Verification & Clinical Notes |
| **🔬 Technician** | `technician@test.com` | `password123` | Sample Collection & Result Entry |
| **👤 Patient** | `patient@test.com` | `password123` | Test Booking & Report Downloads |


---

## 📚 API Documentation

### 🌐 Swagger UI

Access the interactive API documentation at:

| Resource | URL |
| :--- | :--- |
| **Swagger UI** | http://localhost:8080/swagger-ui.html |
| **OpenAPI JSON** | http://localhost:8080/api-docs |
| **Health Check** | http://localhost:8080/api/health |

### 📮 Postman Collection

Import the Postman collection from the `/postman` directory:

- `Healthcare Lab Test Booking API - Working.postman_collection.json` - [Download](postman/)
- `Healthcare Local.postman_environment.json` - [Download](postman/)

**Features:**
- ✅ 50+ API endpoints
- ✅ Auto-authentication with JWT
- ✅ Environment variables
- ✅ Test scripts for validation
- ✅ Detailed documentation

### 💡 Example API Calls

#### 📝 User Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210",
    "gender": "MALE",
    "age": 25,
    "address": "New Delhi, India",
    "dateOfBirth": "1999-01-01",
    "role": "PATIENT"
  }'
```

#### 🔑 User Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "email": "patient@test.com",
    "role": "PATIENT"
  }
}
```

#### 🔍 Get Popular Tests

```bash
curl -X GET http://localhost:8080/api/lab-tests/popular
```

---

## 🧪 Testing

### 📋 Unit Tests

```bash
cd backend
mvn test
```

### 🔗 Integration Tests

```bash
cd backend
mvn verify
```

### 🎭 E2E Tests (Playwright)

```bash
cd frontend
npm run test:e2e
```

### 📮 API Tests (Postman)

```bash
# Install Newman
npm install -g newman

# Run Postman collection
newman run postman/Healthcare\ Lab\ Test\ Booking\ API\ -\ Working.postman_collection.json \
  -e postman/Healthcare\ Local.postman_environment.json
```

### ⚡ Load Tests (JMeter)

```bash
# Run JMeter test plan
jmeter -n -t jmeter/LoadTest.jmx -l results.jtl -e -o reports/
```

---

## 📁 Project Structure

```
HEALTHCARELAB/
├── 🍃 backend/                 # Spring Boot backend
│   ├── 📂 src/
│   │   ├── 📂 main/
│   │   │   ├── 📂 java/
│   │   │   │   └── 📂 com/
│   │   │   │       └── 📂 healthcarelab/
│   │   │   │           ├── ⚙️ config/      # Configuration classes
│   │   │   │           ├── 🎮 controller/  # REST controllers
│   │   │   │           ├── 🏗️ service/     # Business logic
│   │   │   │           ├── 🗄️ repository/  # Data access layer
│   │   │   │           ├── 📄 entity/      # JPA entities
│   │   │   │           ├── 📦 dto/         # Data transfer objects
│   │   │   │           ├── ⚠️ exception/   # Exception handling
│   │   │   │           └── 🔧 util/        # Utility classes
│   │   │   └── 📂 resources/
│   │   │       ├── 📄 application.properties
│   │   │       └── 📂 db/migration/        # Flyway migrations
│   │   └── 📂 test/
│   └── 📄 pom.xml
├── ⚛️ frontend/                # React frontend
│   ├── 📂 src/
│   │   ├── 🧩 components/     # React components
│   │   ├── 📑 pages/          # Page components
│   │   ├── 📡 services/       # API services
│   │   ├── 🏪 context/        # React context
│   │   ├── 🎣 hooks/          # Custom hooks
│   │   ├── 🛠️ utils/          # Utility functions
│   │   └── 🎨 assets/         # Static assets
│   ├── 📂 public/
│   ├── 📄 package.json
│   └── ⚙️ vite.config.ts
├── 📖 docs/                    # Documentation
│   ├── 🏗️ architecture/       # System architecture
│   │   └── 📄 SYSTEM_ARCHITECTURE.md
│   ├── 🔌 api/                # API documentation
│   │   └── 📄 API.md
│   ├── 📘 guide/              # User guides
│   │   ├── 📄 01-START_HERE.md
│   │   └── 📄 02-QUICK_START.md
│   ├── 🗄️ db/                 # Database docs
│   │   └── 📄 DATABASE_MIGRATION_GUIDE.md
│   ├── 📝 overview/           # Project overview
│   │   ├── 📄 PROJECT_OVERVIEW.md
│   │   └── 📄 FEATURES.md
│   └── 📄 PLAN.md             # Project roadmap
├── 📮 postman/                 # Postman collection
│   ├── 📄 Healthcare Lab Test Booking API - Working.collection.json
│   └── 📄 Healthcare Local.environment.json
├── 📄 .gitignore
├── ⚡ startup.bat
└── 📄 README.md
```


---

## 📊 Architecture

### 🏗️ System Architecture

The system follows a **decoupled full-stack architecture** with clear separation of concerns:

- **Frontend:** React 19 + Vite + TypeScript
- **Backend:** Spring Boot 3.2.2 + Spring Security
- **Database:** MySQL 8.0 with Flyway migrations
- **Caching:** Redis for performance optimization
- **API:** RESTful with OpenAPI documentation

### 🔐 Security

- **JWT Authentication:** Stateless token-based authentication
- **RBAC:** Role-based access control (PATIENT, TECHNICIAN, MEDICAL_OFFICER, ADMIN)
- **Password Encryption:** BCrypt with strength 10
- **Input Validation:** Bean Validation API
- **CORS:** Configured for cross-origin requests

### ⚡ Performance

- **Database Indexing:** 31 optimized indexes across 16 tables
- **Redis Caching:** Caching for frequently accessed data
- **Connection Pooling:** HikariCP for efficient database connections
- **Query Optimization:** JPQL with N+1 prevention
- **Frontend Virtualization:** React Window for large lists

For detailed architecture documentation, see [docs/architecture/SYSTEM_ARCHITECTURE.md](docs/architecture/SYSTEM_ARCHITECTURE.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 Open a Pull Request

### 📝 Coding Standards

- Follow Java naming conventions
- Use TypeScript for frontend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

### 🐛 Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, version)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**AMANJEET KUMAR**

<div align="center">

[![Instagram](https://img.shields.io/badge/Instagram-%40amanjeet233-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/amanjeet233)
[![GitHub](https://img.shields.io/badge/GitHub-amanjeet233-181717?style=for-the-badge&logo=github)](https://github.com/amanjeet233)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-amanjeet233-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/amanjeet233)

</div>

---

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot) team for the amazing framework
- [React](https://react.dev/) team for the excellent UI library
- The open-source community for valuable tools and libraries
- All contributors who have helped improve this project

---

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/amanjeet233/HEALTHCARELAB/issues)
- 💬 [Discussions](https://github.com/amanjeet233/HEALTHCARELAB/discussions)
- 📧 Email: amanjeet233@gmail.com

---

<div align="center">

### ⭐ If you find this project helpful, please give it a star! ⭐

[![GitHub stars](https://img.shields.io/github/stars/amanjeet233/HEALTHCARELAB?style=for-the-badge&logo=github)](https://github.com/amanjeet233/HEALTHCARELAB)

---

<i>Built with ❤️ by <b>AMANJEET KUMAR</b></i>

[![Instagram](https://img.shields.io/badge/Instagram-%40amanjeet233-E4405F?style=flat-square&logo=instagram)](https://instagram.com/amanjeet233)
[![GitHub](https://img.shields.io/badge/GitHub-amanjeet233-181717?style=flat-square&logo=github)](https://github.com/amanjeet233)

**© 2024-2026 Healthcare Lab. All rights reserved.**



</div>
