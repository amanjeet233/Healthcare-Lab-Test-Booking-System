# HealthLab — Healthcare Lab Booking System

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, full-featured healthcare lab booking platform where **Patients** book lab tests, **Doctors** approve/reject bookings, and **Technicians** manage sample collections. Built with React 19, TypeScript, Tailwind CSS v4, and Framer Motion.

---

## Features

- **Role-based dashboards** — Patient, Doctor, Technician, Admin
- **Lab test catalog** — Search, filter, and book tests
- **Booking management** — Status timeline, cancellation, invoice download
- **Doctor approvals** — Confirm/reject bookings, patient history
- **Technician collections** — Assigned routes, mark samples collected
- **Dark mode** — Persistent toggle with Tailwind `dark:` variant
- **Offline support** — PWA with service worker caching
- **Animations** — Framer Motion page transitions and micro-interactions
- **Skeleton loaders** — Content-shaped loading placeholders
- **Accessibility** — WCAG AA focus rings, ARIA labels, keyboard navigation

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 20 |
| npm | >= 10 |
| Backend API | Spring Boot (running on port 8080) |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/healthlab.git
cd healthlab/frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# 4. Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |
| `VITE_APP_ENV` | Environment name | `development` |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | _(empty, optional)_ |
| `VITE_GA_TRACKING_ID` | Google Analytics ID | _(empty, optional)_ |

Files: `.env.example` (template), `.env.production`, `.env.staging`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the frontend dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Project Structure

```
frontend/
├── public/               # Static assets, _redirects (Netlify)
├── src/
│   ├── assets/           # Images, SVGs
│   ├── components/
│   │   ├── common/       # Card, StatusBadge, LoadingSpinner, ErrorBoundary,
│   │   │                   ConfirmationModal, PageTransition
│   │   └── layout/       # Navbar, Sidebar, Footer, DashboardLayout,
│   │                       AnimatedRoutes, ProtectedRoute
│   ├── context/          # AuthContext (session management)
│   ├── hooks/            # useAuth
│   ├── pages/
│   │   ├── auth/         # Login, Register
│   │   └── dashboard/
│   │       ├── patient/  # LabTests, BookTest, MyBookings, BookingDetails,
│   │       │               PatientProfile
│   │       ├── doctor/   # PendingApprovals, AllBookings, PatientHistory
│   │       └── technician/ # AssignedCollections, CollectionHistory
│   ├── services/         # api.ts, booking.ts, labTest.ts, doctorService.ts,
│   │                       technicianService.ts, userService.ts
│   ├── types/            # TypeScript interfaces (booking, user, labTest)
│   ├── utils/            # toast.ts, sentry.ts, navigation.ts
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point (Sentry init, Web Vitals)
│   └── index.css         # Tailwind directives & custom variants
├── tests/                # Playwright E2E tests
├── .github/workflows/    # CI/CD (ci.yml, deploy.yml)
├── vercel.json           # Vercel deployment config
└── package.json
```

---

## API Integration

The frontend connects to a **Spring Boot** backend. All API calls go through the centralized Axios instance in `src/services/api.ts` which provides:

- **Base URL** from `VITE_API_BASE_URL` environment variable
- **Automatic retries** (3 attempts with exponential backoff) via `axios-retry`
- **Session-based auth** with `withCredentials: true`
- **Request/response interceptors** for dev logging and 401 redirect

### Key Endpoints

| Service | Endpoint | Method |
|---------|----------|--------|
| Auth | `/auth/login`, `/auth/register` | POST |
| Lab Tests | `/lab-tests` | GET |
| Bookings | `/bookings`, `/bookings/{id}` | GET, POST |
| Doctor | `/mo/pending`, `/bookings/{id}/status` | GET, PUT |
| Technician | `/bookings/technician` | GET |
| Profile | `/users/profile` | GET, PUT |

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. The build process:
1. Runs TypeScript type checking (`tsc -b`)
2. Bundles the production app with the configured frontend build pipeline
3. Splits vendor chunk (React, Framer Motion)
4. Generates bundle analysis (`bundle-analysis.html`)
5. Creates PWA service worker

---

## Deployment

### Vercel (Recommended)
1. Connect your Git repo to Vercel
2. Build command: `npm run build` | Output: `dist`
3. Add env vars in Vercel dashboard
4. `vercel.json` handles SPA routing and caching headers

### Netlify
1. Build command: `npm run build` | Publish: `dist`
2. `public/_redirects` handles SPA routing

### GitHub Actions CI/CD
- **`ci.yml`** — Lint + typecheck + build on every PR
- **`deploy.yml`** — Auto-deploy to Vercel on merge to `main`

---

## Testing

```bash
# Run Playwright E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
