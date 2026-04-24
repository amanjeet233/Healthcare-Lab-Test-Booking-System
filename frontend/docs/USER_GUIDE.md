# HealthLab User Guide

Welcome to HealthLab! This guide walks you through the platform based on your role.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Patient Guide](#patient-guide)
3. [Doctor Guide](#doctor-guide)
4. [Technician Guide](#technician-guide)
5. [FAQ](#faq)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Creating an Account
1. Navigate to the **Register** page
2. Fill in your details: name, email, password, phone, date of birth, gender
3. Select your role (Patient by default)
4. Click **Register** — you'll be redirected to login

### Logging In
1. Enter your email and password on the **Login** page
2. You'll be automatically redirected to your role's dashboard

### Dark Mode
Click the **sun/moon icon** in the top-right navbar to toggle dark mode. Your preference is saved automatically.

---

## Patient Guide

### Dashboard Overview
Your dashboard shows:
- **Total Tests** — all bookings you've made
- **Upcoming** — pending or confirmed bookings
- **Completed** — finished tests
- **Cancelled** — cancelled bookings
- **Recent Bookings** — your last 5 bookings with quick access

### How to Book a Test

1. Click **Book a Test** from your dashboard or sidebar
2. Browse the test catalog — use **search** and **filters** to find your test
3. Click on a test card to see full details (description, price, turnaround time)
4. Click **Book Now** on the test detail page
5. Fill out the booking form:
   - Select a **date** (must be in the future)
   - Choose a **time slot**
   - Select **collection type** (Lab Visit or Home Collection)
   - If Home Collection, enter your **address**
   - Add any **notes** (e.g., "fasting since 10pm")
6. Review the **price breakdown**
7. Click **Confirm Booking**
8. You'll see a success message with your booking reference

### Managing Bookings

**View My Bookings:**
- Navigate to **My Bookings** from the sidebar
- Use the status tabs (All, Pending, Confirmed, etc.) to filter
- Click any booking card to see full details

**Cancel a Booking:**
- Open the booking (must be in PENDING status)
- Click **Cancel Booking**
- Confirm in the modal dialog
- The booking status changes to CANCELLED

**Download Invoice:**
- Open a booking's detail page
- Click **Download Invoice** (PDF format)

**Print Booking:**
- On the booking detail page, click **Print**

### Profile Management

1. Go to **Profile** from the sidebar
2. View your personal details
3. Click **Edit Profile** to update name, phone, address
4. Use **Change Password** for security
5. **Delete Account** removes your data permanently (requires confirmation)

---

## Doctor Guide

### Dashboard Overview
Your dashboard shows:
- **Pending Approvals** — bookings waiting for your review
- **Today's Bookings** — active bookings for today
- **Total Patients** — unique patients this month
- **Completed Tests** — tests finished this month
- **Recent Pending** — last 5 pending approvals with quick actions

### How to Confirm/Reject Bookings

1. Navigate to **Pending Approvals** from the sidebar
2. Review the table of pending bookings
3. Use filters (date range, test type, patient search) to narrow results
4. For each booking, click:
   - **Confirm** (green button) — status changes to CONFIRMED
   - **Reject** (red button) — status changes to CANCELLED
5. A success toast confirms your action
6. The list refreshes automatically

### Viewing All Bookings

1. Go to **All Bookings** from the sidebar
2. Use advanced filters: status, date range, patient search, test type
3. Click column headers to sort
4. Use **Export CSV** or **Export PDF** for reports
5. Click **View Details** on any booking for full information

### Patient History

1. Navigate to **Patient History**
2. Search for a patient by name, email, or phone
3. Select a patient from the results
4. View their profile summary and complete booking history
5. Use **Rebook** to quickly create a new booking for a previous test

---

## Technician Guide

### Dashboard Overview
Your dashboard shows:
- **Today's Collections** — samples to collect today
- **Pending** — not yet collected
- **Completed Today** — marked as collected
- **This Week** — total assigned for the week

### How to Mark Samples Collected

1. Navigate to **Assigned Collections** from the sidebar
2. View your collection cards, each showing:
   - Patient name and phone (tap to call)
   - Full address (with Google Maps link for home collections)
   - Test name and special instructions
   - Preferred time slot
3. Sort by time, distance, or priority
4. When you've collected a sample, click **Mark Collected**
5. Confirm in the dialog
6. The card moves to your history

### Collection History

1. Go to **Collection History** from the sidebar
2. Filter by date range (default: last 7 days)
3. Search by patient name or booking reference
4. View stats: total collections, most common test
5. Export as **CSV** or **PDF** for daily reporting

---

## FAQ

**Q: Can I book a test for someone else?**
A: Currently, bookings are linked to your account. Family member booking is planned for a future release.

**Q: How do I know when my results are ready?**
A: Your booking status will change to COMPLETED. Check your dashboard or My Bookings page.

**Q: Can I reschedule a booking?**
A: Cancel the existing booking and create a new one with your preferred date/time.

**Q: Is my data secure?**
A: Yes. We use session-based authentication, HTTPS, and security headers (X-Frame-Options, XSS Protection).

**Q: Does the app work offline?**
A: Basic pages are cached via our service worker. You'll see an offline indicator if connectivity is lost.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Page shows "Something went wrong" | Click **Try Again** to reload. If persistent, clear browser cache. |
| Login fails repeatedly | Check your email/password. Try resetting your password. |
| Booking form won't submit | Check for validation errors (red text under fields). Ensure all required fields are filled. |
| Dark mode looks wrong | Hard-refresh the page (Ctrl+Shift+R). |
| Toast notifications not showing | Check if browser notifications are blocked. |
| Slow loading | Check your internet connection. The app retries failed requests automatically. |
