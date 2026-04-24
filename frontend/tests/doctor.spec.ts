import { test, expect, Page } from '@playwright/test';

/**
 * Doctor Flow E2E Tests (Optimized & Mocked)
 * Covers: Dashboard, Pending Approvals, All Bookings, Patient History
 */

const BASE = 'http://localhost:5173';

const mockDoctorData = {
    user: { id: 2, name: 'Dr. Jane Smith', role: 'MEDICAL_OFFICER', email: 'doctor@test.com' },
    stats: {
        todayBookings: 12,
        totalPatientsMonth: 145,
        completedTests: 89,
        pendingCount: 5
    },
    pendingBookings: {
        content: [
            {
                id: 10,
                reference: 'BKG-PEND-10',
                patientId: 5,
                patientName: 'Alice Brown',
                testName: 'Lipid Profile',
                bookingDate: '2026-03-08',
                timeSlot: '09:00:00',
                collectionType: 'LAB',
                status: 'PENDING'
            }
        ],
        totalPages: 1
    },
    allBookings: {
        content: [
            {
                id: 1,
                reference: 'BKG-HIST-01',
                patientId: 10,
                patientName: 'John Doe',
                testName: 'CBC',
                bookingDate: '2026-03-01',
                timeSlot: '10:00:00',
                collectionType: 'HOME',
                status: 'COMPLETED',
                totalAmount: 50.0,
                paymentStatus: 'PAID'
            }
        ],
        totalPages: 5
    },
    patients: [
        { id: 10, name: 'John Doe', email: 'john@example.com', phone: '555-0123', bloodGroup: 'A+', age: 42 }
    ]
};

const selectors = {
    statValuePending: '[data-testid="stat-value-pending"]',
    statCardToday: '[data-testid="stat-card-today"]',
    requiresAttention: '[data-testid="requires-attention-section"]',
    pendingTable: '[data-testid="pending-approvals-table"]',
    pendingSearch: '[data-testid="pending-approvals-search-input"]',
    approveBtn: '[data-testid="approve-button"]',
    rejectBtn: '[data-testid="reject-button"]',
    allBookingsTable: '[data-testid="all-bookings-table"]',
    bookingsSearch: '[data-testid="bookings-search-input"]',
    historySearch: '[data-testid="patient-history-search"]',
    historyResult: '[data-testid="history-result-card"]',
    loadingSkeleton: '[data-testid="dashboard-loading-skeleton"]'
};

async function loginAsDoctor(page: Page) {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('[data-testid="email-input"]', 'doctor@test.com');
    await page.fill('[data-testid="password-input"]', 'Password@123');
    await page.selectOption('[data-testid="role-select"]', 'MEDICAL_OFFICER');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('**/dashboard/doctor', { timeout: 15000 });
}

test.describe.serial('Doctor Flow (Mocked)', () => {
    test.beforeEach(async ({ page }) => {
        // API Mocks
        await page.route('**/api/auth/login', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ jwt: 'mock-token', user: mockDoctorData.user })
            });
        });

        await page.route('**/api/users/profile', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockDoctorData.user)
            });
        });

        await page.route('**/api/mo/pending/count', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockDoctorData.stats.pendingCount)
            });
        });

        await page.route('**/api/mo/pending*', async route => {
            if (route.request().url().includes('/count')) {
                await route.fulfill({ status: 200, body: JSON.stringify(mockDoctorData.stats.pendingCount) });
            } else {
                await route.fulfill({ status: 200, body: JSON.stringify(mockDoctorData.pendingBookings) });
            }
        });

        await page.route('**/api/bookings*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify(mockDoctorData.allBookings) });
        });

        await page.route('**/api/users/patients/search*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify(mockDoctorData.patients) });
        });

        await page.route('**/api/patients/*/bookings', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify(mockDoctorData.allBookings.content) });
        });

        await loginAsDoctor(page);
    });

    test('TC-E2E-15: Dashboard stats and summary', async ({ page }) => {
        await expect(page.locator(selectors.statValuePending)).toBeVisible({ timeout: 15000 });
        await expect(page.locator(selectors.statValuePending)).toHaveText('5');
        await expect(page.locator(selectors.requiresAttention)).toBeVisible();
    });

    test('TC-E2E-19: Dashboard loading states', async ({ page }) => {
        await page.route('**/api/mo/pending/count', async route => {
            await new Promise(resolve => setTimeout(resolve, 800));
            await route.fulfill({ status: 200, body: JSON.stringify(mockDoctorData.stats.pendingCount) });
        });

        await page.goto(`${BASE}/dashboard/doctor`);
        await expect(page.locator(selectors.loadingSkeleton)).toBeVisible();
        await expect(page.locator(selectors.loadingSkeleton)).toBeHidden({ timeout: 10000 });
    });

    test('TC-E2E-16: Pending Approvals list and actions', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/doctor/pending`);
        await expect(page.locator(selectors.pendingTable)).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Alice Brown')).toBeVisible();
        await expect(page.locator(selectors.approveBtn).first()).toBeVisible();
    });

    test('TC-E2E-17: All Bookings management', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/doctor/all-bookings`);
        await expect(page.locator(selectors.allBookingsTable)).toBeVisible({ timeout: 15000 });

        const searchInput = page.locator(selectors.bookingsSearch);
        await searchInput.fill('John');
        await page.waitForTimeout(600);
        await expect(page.getByText('John Doe')).toBeVisible();
    });

    test('TC-E2E-18: Patient lookup and history', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/doctor/history`);
        const searchInput = page.locator(selectors.historySearch);
        await expect(searchInput).toBeVisible({ timeout: 10000 });
        await searchInput.fill('John');
        await page.waitForTimeout(1000);

        await expect(page.locator(selectors.historyResult)).toBeVisible({ timeout: 10000 });
        await page.locator(selectors.historyResult).click();
        await expect(page.getByRole('heading', { name: 'Test History' })).toBeVisible({ timeout: 10000 });
    });
});
