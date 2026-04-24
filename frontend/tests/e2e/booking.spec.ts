import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe.serial('Auth Navigation & Validation (Fast)', () => {
    test('TC-E2E-A1: Redirect to login from root', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'load' });
        await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    });

    test('TC-E2E-A2: Navigate to registration form', async ({ page }) => {
        await page.goto(`${BASE}/login`, { waitUntil: 'load' });
        await page.locator('[data-testid="register-link"]').click();
        await expect(page).toHaveURL(/.*register/, { timeout: 10000 });

        // Assert elements
        await expect(page.locator('text=Create an Account')).toBeVisible();
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
        await expect(page.locator('select')).toBeVisible();
    });

    test('TC-E2E-A3: Navigate back to login from registration', async ({ page }) => {
        await page.goto(`${BASE}/register`, { waitUntil: 'load' });
        await page.locator('[data-testid="login-link"]').click();
        await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    });

    test('TC-E2E-A4: Validate empty submit on login page', async ({ page }) => {
        await page.goto(`${BASE}/login`, { waitUntil: 'load' });

        // Use data-testid for speed
        await page.click('[data-testid="login-submit"]');

        // Check if validations fire
        await expect(page.getByText('Email is required')).toBeVisible();
        await expect(page.getByText('Password is required')).toBeVisible();
    });
});
