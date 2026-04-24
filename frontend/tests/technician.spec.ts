import { test, expect, Page } from '@playwright/test';

/**
 * Technician Flow E2E Tests (Optimized & Mocked)
 * Covers: Dashboard, Assigned Collections, Collection History
 */

const BASE = 'http://localhost:5173';

const mockTechData = {
    user: { id: 3, name: 'Tech Tom', role: 'TECHNICIAN', email: 'technician@test.com' },
    assignedCollections: [
        {
            id: 101,
            reference: 'BKG-TC-101',
            patientId: 2,
            patientName: 'Alice Smith',
            patientPhone: '555-0202',
            testId: 1,
            testName: 'Lipid Profile',
            bookingDate: new Date().toISOString().split('T')[0],
            timeSlot: '09:00:00',
            collectionType: 'HOME',
            collectionAddress: '123 Meadow Lane, Apt 4',
            status: 'CONFIRMED',
            totalAmount: 50.0,
            paymentStatus: 'PAID'
        }
    ],
    history: [
        {
            id: 500,
            reference: 'BKG-HIST-500',
            patientId: 10,
            patientName: 'John Old',
            testId: 2,
            testName: 'Complete Blood Count',
            bookingDate: '2026-03-01',
            timeSlot: '10:00:00',
            collectionType: 'HOME',
            collectionAddress: '789 Pine St',
            status: 'COMPLETED',
            totalAmount: 40.0,
            paymentStatus: 'PAID'
        }
    ]
};

const selectors = {
    statValueToday: '[data-testid="stat-value-today"]',
    statValuePending: '[data-testid="stat-value-pending"]',
    recentCollections: '[data-testid="recent-collections-section"]',
    collectionsGrid: '[data-testid="assigned-collections-grid"]',
    statusSelect: '[data-testid="filter-status-select"]',
    updateBtn: '[data-testid="update-status-button"]',
    historyTable: '[data-testid="collection-history-table"]',
    historySearch: '[data-testid="history-search-input"]',
    loadingSpinner: '[data-testid="tech-dashboard-loading"]',
    loadingSkeleton: '[data-testid="tech-loading-skeleton"]'
};

async function loginAsTechnician(page: Page) {
    await page.goto(`${BASE}/login`, { waitUntil: 'load' });
    await page.fill('[data-testid="email-input"]', 'technician@test.com');
    await page.fill('[data-testid="password-input"]', 'Password@123');
    await page.selectOption('[data-testid="role-select"]', 'TECHNICIAN');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('**/dashboard/technician', { timeout: 15000 });
}

test.describe.serial('Technician Flow (Mocked)', () => {
    test.beforeEach(async ({ page }) => {
        // API Mocks
        await page.route('**/api/auth/login', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ jwt: 'mock-token', user: mockTechData.user })
            });
        });

        await page.route('**/api/users/profile', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify(mockTechData.user) });
        });

        await page.route('**/api/bookings/technician/history*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ content: mockTechData.history, totalPages: 1 })
            });
        });

        await page.route('**/api/bookings/technician*', async route => {
            if (!route.request().url().includes('/history')) {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify({ content: mockTechData.assignedCollections, totalPages: 1 })
                });
            }
        });

        await page.route('**/api/bookings/*/status*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ ...mockTechData.assignedCollections[0], status: 'SAMPLE_COLLECTED' })
            });
        });

        await loginAsTechnician(page);
    });

    test('TC-E2E-19: Dashboard overview and stats', async ({ page }) => {
        await expect(page.locator(selectors.statValueToday)).toBeVisible({ timeout: 10000 });
        await expect(page.locator(selectors.statValueToday)).toHaveText(/[0-9]+/);
        await expect(page.locator(selectors.statValuePending)).toBeVisible();
        await expect(page.locator(selectors.recentCollections)).toBeVisible();
    });

    test('TC-E2E-20: Assigned Collections grid and filter', async ({ page }) => {
        const gridPromise = page.waitForResponse('**/api/bookings/technician*');
        await page.goto(`${BASE}/dashboard/technician/collections`);
        await gridPromise;

        await expect(page.locator(selectors.collectionsGrid)).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Alice Smith')).toBeVisible();
    });

    test('TC-E2E-21: Collection History lookup', async ({ page }) => {
        const histPromise = page.waitForResponse('**/api/bookings/technician/history*');
        await page.goto(`${BASE}/dashboard/technician/history`);
        await histPromise;

        await expect(page.locator(selectors.historyTable)).toBeVisible({ timeout: 15000 });

        await page.locator(selectors.historySearch).fill('John');
        // Debounce wait
        await page.waitForTimeout(700);
        await expect(page.getByText('John Old')).toBeVisible();
    });

    test('TC-E2E-25: Dashboard loading state', async ({ page }) => {
        // Slow down the collections mock
        await page.route('**/api/bookings/technician*', async route => {
            if (!route.request().url().includes('/history')) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify({ content: mockTechData.assignedCollections, totalPages: 1 })
                });
            }
        });

        await page.goto(`${BASE}/dashboard/technician`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator(selectors.loadingSpinner)).toBeVisible();
        await expect(page.locator(selectors.loadingSpinner)).toBeHidden({ timeout: 10000 });
    });
});

test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/auth/login', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ jwt: 'mock-token', user: mockTechData.user })
            });
        });
    });

    test('TC-E2E-22: Mobile Login Viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(`${BASE}/login`);
        await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
    });
});
