# Component Documentation

This document lists all reusable UI components with their props and usage examples.

---

## Common Components

### Card

A reusable container with shadow, rounded corners, and dark mode support. Wrapped in `React.memo`.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | _(required)_ | Content to render inside |
| `className` | `string` | `''` | Additional CSS classes |
| `noPadding` | `boolean` | `false` | Remove default `p-6` padding |
| `onClick` | `() => void` | — | Makes the card interactive |

**Usage:**
```tsx
<Card>
  <h3>Patient Statistics</h3>
  <p>Total bookings: 42</p>
</Card>

<Card onClick={() => navigate('/details')} className="hover:shadow-lg">
  <p>Clickable card</p>
</Card>
```

---

### StatusBadge

Displays booking status with color-coded badges and icons. Wrapped in `React.memo`.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `BadgeStatus` | _(required)_ | One of: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `SAMPLE_COLLECTED` |
| `className` | `string` | `''` | Additional CSS classes |

**Usage:**
```tsx
<StatusBadge status="CONFIRMED" />
<StatusBadge status="PENDING" className="text-sm" />
```

---

### LoadingSpinner

Configurable size loading spinner with Tailwind animation.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `className` | `string` | `''` | Additional CSS classes |

---

### ConfirmationModal

A modal dialog for destructive actions (cancel booking, delete account, logout).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | _(required)_ | Controls visibility |
| `onClose` | `() => void` | _(required)_ | Close handler |
| `onConfirm` | `() => void` | _(required)_ | Confirm handler |
| `title` | `string` | _(required)_ | Modal title |
| `message` | `string` | _(required)_ | Body text |
| `confirmText` | `string` | `'Confirm'` | Confirm button label |
| `cancelText` | `string` | `'Cancel'` | Cancel button label |
| `variant` | `'danger' \| 'warning'` | `'danger'` | Button color scheme |

---

### ErrorBoundary

Catches rendering errors and displays a fallback UI with a retry button.

**Usage:**
```tsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

### PageTransition

Wraps page content with Framer Motion fade/slide animation.

**Usage:**
```tsx
<PageTransition>
  <DashboardPage />
</PageTransition>
```

---

## Layout Components

### Navbar
Top navigation bar with dark mode toggle, user menu, and mobile hamburger.

### Sidebar
Collapsible sidebar with role-based navigation links and `aria-current` active states.

### DashboardLayout
Wrapper combining Navbar + Sidebar + main content area with responsive behavior.

### ProtectedRoute
Route guard that redirects unauthenticated users to `/login`.

### AnimatedRoutes
Route definitions with `React.lazy()` code splitting and `AnimatePresence` transitions.

---

## Utilities

### `notify` (toast.ts)
```typescript
notify.success('Booking confirmed!');
notify.error('Something went wrong');
notify.info('Please wait...');
```

### `initSentry` (sentry.ts)
Initializes Sentry error tracking. Dynamically loads SDK only when `VITE_SENTRY_DSN` is configured.

### `reportWebVitals` (reportWebVitals.ts)
Reports Core Web Vitals (FCP, LCP, CLS, INP, TTFB) with threshold warnings in development.
