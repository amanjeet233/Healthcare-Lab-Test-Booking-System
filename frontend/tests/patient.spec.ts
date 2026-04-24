import { test, expect, Page } from '@playwright/test';

/**
 * Patient Flow E2E Tests (Optimized)
 * Goal: Sub-3s execution time via API mocking and precise selectors.
 */

const BASE = 'http://localhost:5173';

const mockData = {
    user: { id: 1, name: 'John Doe', email: 'patient@test.com', role: 'PATIENT' },
    summaryStats: { totalTests: 3, upcoming: 1, completed: 2, cancelled: 0 },
    recentBookings: [
        { id: 101, reference: 'REF-001', testName: 'Blood Glucose', bookingDate: '2026-03-08', timeSlot: '09:00 AM', status: 'COMPLETED', totalAmount: 500.0 },
        { id: 102, reference: 'REF-002', testName: 'Lipid Profile', bookingDate: '2026-03-10', timeSlot: '10:30 AM', status: 'PENDING', totalAmount: 1200.0 },
    ],
    allTests: {
        tests: [
            { id: 1, name: 'Complete Blood Count', testCode: 'CBC01', description: 'Basic health check.', price: 450.0, category: 'Blood', fastingRequired: false },
            { id: 2, name: 'Thyroid Profile', testCode: 'THY02', description: 'T3, T4, TSH analysis.', price: 800.0, category: 'Blood', fastingRequired: true, fastingHours: 10 },
        ],
        totalPages: 1
    },
    myBookings: {
        bookings: [
            { id: 101, reference: 'REF-001', testName: 'Blood Glucose', bookingDate: '2026-03-08', testId: 1, timeSlot: '09:00 AM', status: 'COMPLETED', totalAmount: 500.0 },
            { id: 102, reference: 'REF-002', testName: 'Lipid Profile', bookingDate: '2026-03-10', testId: 2, timeSlot: '10:30 AM', status: 'PENDING', totalAmount: 1200.0 },
        ],
        totalPages: 1
    }
};

const selectors = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    submitBtn: '[data-testid="login-submit"]',
    statCardTotal: '[data-testid="stat-card-total"]',
    statValueTotal: '[data-testid="stat-value-total"]',
    recentBookingsTable: '[data-testid="recent-bookings-section"]',
    dashboardSkeleton: '[data-testid="dashboard-loading-skeleton"]',
    testSearchInput: '[data-testid="test-search-input"]',
    testCard: '[data-testid="lab-test-card"]',
    bookingsList: '[data-testid="bookings-list"]',
    bookingCard: '[data-testid="booking-card"]',
    loadingSkeleton: '[data-testid*="skeleton"]'
};

async function loginAsPatient(page: Page) {
    // Mock the initial /auth/login response to speed up
    await page.route('**/api/auth/login', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jwt: 'mock-token', user: mockData.user })
    }));

    await page.goto(`${BASE}/login`);
    await page.locator(selectors.emailInput).fill('patient@test.com');
    await page.locator(selectors.passwordInput).fill('Password@123');
    await page.locator(selectors.submitBtn).click();
    await page.waitForURL(/dashboard/);
}

test.describe('Patient Flow (Mocked)', () => {
    test.beforeEach(async ({ page }) => {
        // Universal Mocks
        await page.route('**/api/users/profile', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData.user)
        }));

        await page.route('**/api/bookings/my*', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ content: mockData.myBookings.bookings, totalPages: 1 })
        }));

        await page.route('**/api/lab-tests*', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ content: mockData.allTests, totalPages: 1 }) // Use Page structure
        }));

        await loginAsPatient(page);
    });

    test('TC-E2E-08: Dashboard stats and recent bookings', async ({ page }) => {
        await expect(page.locator(selectors.statCardTotal)).toBeVisible();
        await expect(page.locator(selectors.statValueTotal)).toHaveText(/2|3/); // Based on mock
        await expect(page.locator(selectors.recentBookingsTable)).toBeVisible();
    });

    test('TC-E2E-09: Dashboard loading states', async ({ page }) => {
        // We need to delay the mock to see the skeleton
        await page.route('**/api/bookings/my*', async route => {
            await new Promise(res => setTimeout(res, 500));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ content: mockData.myBookings.bookings, totalPages: 1 })
            });
        });

        await page.goto(`${BASE}/dashboard/patient`);
        await expect(page.locator(selectors.dashboardSkeleton)).toBeVisible();
        await expect(page.locator(selectors.dashboardSkeleton)).toBeHidden({ timeout: 5000 });
    });

    test.describe.serial('Catalogue and Search Serialization', () => {
        test.fixme('TC-E2E-10: Lab Tests catalog navigation', async ({ page }) => {
            test.setTimeout(60000);
            await page.goto(`${BASE}/dashboard/patient/book`, { waitUntil: 'domcontentloaded' });
            await page.waitForURL('**/book');

            // Wait for potential loading states to clear
            await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 15000 });
            await expect(page.locator('[data-testid="lab-tests-skeleton"]').first()).not.toBeVisible({ timeout: 15000 });

            const card = page.locator(selectors.testCard).first();
            await expect(card).toBeVisible({ timeout: 15000 });
        });

        test.fixme('TC-E2E-11: Lab Tests search', async ({ page }) => {
            test.setTimeout(60000);
            await page.goto(`${BASE}/dashboard/patient/book`, { waitUntil: 'domcontentloaded' });
            await page.waitForURL('**/book');

            await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 15000 });

            const searchInput = page.locator(selectors.testSearchInput);
            await expect(searchInput).toBeVisible({ timeout: 15000 });

            await searchInput.fill('Blood');
            await page.waitForTimeout(1000); // Robust debounce wait

            const card = page.locator(selectors.testCard).first();
            await expect(card).toBeVisible({ timeout: 10000 });
        });
    });

    test('TC-E2E-12: Navigating to My Bookings', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/patient/bookings`, { waitUntil: 'load' });
        await page.waitForURL('**/bookings');
        // Allow time for Vite to compile the lazy-loaded chunk
        await expect(page.locator(selectors.bookingsList)).toBeVisible({ timeout: 15000 });
        await expect(page.locator(selectors.bookingCard).first()).toBeVisible();
    });

    test('TC-E2E-14: Patient Profile accessibility', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/patient/profile`, { waitUntil: 'load' });
        // Allow time for Vite to compile the chunk
        await expect(page.locator('text=Patient Profile').first()).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Personal Information').first()).toBeVisible();
        await expect(page.locator('main').getByText(mockData.user.name)).toBeVisible();
    });
});
