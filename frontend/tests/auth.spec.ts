import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 *
 * Optimized with data-testid selectors for reliability and speed.
 */

const BASE = 'http://localhost:5173';

// ─── Helpers ──────────────────────────────────────────────
const selectors = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    roleSelect: '[data-testid="role-select"]',
    submitBtn: '[data-testid="login-submit"]',
    registerBtn: '[data-testid="register-submit"]',
    registerLink: '[data-testid="register-link"]',
    loginLink: '[data-testid="login-link"]',
    forgotLink: '[data-testid="forgot-password-link"]',
    forgotEmail: '[data-testid="forgot-email-input"]',
    forgotSubmit: '[data-testid="forgot-password-submit"]',
    resetPassword: '[data-testid="reset-password-input"]',
    resetConfirm: '[data-testid="reset-confirm-password-input"]',
    resetSubmit: '[data-testid="reset-password-submit"]',
} as const;

// ─── 1. Protected Route Redirect ─────────────────────────
test.describe('Protected Routes', () => {
    test('TC-AUTH-01: redirects from /dashboard/patient without auth', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/patient`);
        await expect(page).toHaveURL(/login/);
    });

    test('TC-AUTH-02: redirects from /dashboard/doctor without auth', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/doctor`);
        await expect(page).toHaveURL(/login/);
    });

    test('TC-AUTH-03: redirects from /dashboard/technician without auth', async ({ page }) => {
        await page.goto(`${BASE}/dashboard/technician`);
        await expect(page).toHaveURL(/login/);
    });
});

// ─── 2. Login Form Rendering ──────────────────────────────
test.describe('Login Form', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE}/login`, { waitUntil: 'load' });
        // Wait for Vite to compile the chunk if this is the first hit
        await page.waitForSelector(selectors.emailInput, { state: 'visible', timeout: 15000 });
    });

    test('TC-AUTH-04: renders all form fields with test-ids', async ({ page }) => {
        await expect(page.locator(selectors.emailInput)).toBeVisible();
        await expect(page.locator(selectors.passwordInput)).toBeVisible();
        await expect(page.locator(selectors.roleSelect)).toBeVisible();
        await expect(page.locator(selectors.submitBtn)).toBeVisible();
    });

    test('TC-AUTH-05: renders heading and sub-text', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Welcome Back');
    });

    test('TC-AUTH-06: renders forgot-password link', async ({ page }) => {
        await expect(page.locator(selectors.forgotLink)).toBeVisible();
    });

    test('TC-AUTH-07: role dropdown has 3 options', async ({ page }) => {
        const options = page.locator(`${selectors.roleSelect} option`);
        await expect(options).toHaveCount(3);
    });
});

// ─── 3. Form Validation ──────────────────────────────────
test.describe('Login Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE}/login`, { waitUntil: 'load' });
        // Guarantee DOM is injected from Vite before clicking elements
        await page.waitForSelector(selectors.emailInput, { state: 'visible', timeout: 15000 });
    });

    test('TC-AUTH-08: shows errors on empty submit', async ({ page }) => {
        await page.locator(selectors.submitBtn).click();
        await expect(page.locator('text=Email is required')).toBeVisible();
        await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('TC-AUTH-09: shows error for invalid email format', async ({ page }) => {
        await page.locator(selectors.emailInput).fill('not-an-email');
        await page.locator(selectors.submitBtn).click();
        await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });
});

// ─── 4. Auth Navigation ───────────────────────────────────────
test.describe('Auth Navigation', () => {
    test('TC-AUTH-15: login → register navigation', async ({ page }) => {
        await page.goto(`${BASE}/login`);
        await page.locator(selectors.registerLink).click();
        await expect(page).toHaveURL(/register/);
    });

    test('TC-AUTH-16: register → login navigation', async ({ page }) => {
        await page.goto(`${BASE}/register`);
        await page.locator(selectors.loginLink).click();
        await expect(page).toHaveURL(/login/);
    });

    test('TC-AUTH-17: login → forgot password navigation', async ({ page }) => {
        await page.goto(`${BASE}/login`);
        await page.locator(selectors.forgotLink).click();
        await expect(page).toHaveURL(/forgot-password/);
    });
});

// ─── 5. Password Reset Flow ────────────────────────────────
test.describe('Password Reset Flow', () => {
    test('TC-AUTH-27: complete forgot password journey', async ({ page }) => {
        // Mock the API response
        await page.route('**/api/auth/forgot-password', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Reset link sent' })
        }));

        await page.goto(`${BASE}/forgot-password`);
        await page.locator(selectors.forgotEmail).fill('patient@test.com');
        await page.locator(selectors.forgotSubmit).click();

        // Should show success state
        await expect(page.locator('text=Check your email')).toBeVisible();
    });

    test('TC-AUTH-28: reset password form validation', async ({ page }) => {
        await page.goto(`${BASE}/reset-password?token=mock-token`);
        await page.locator(selectors.resetPassword).fill('short');
        await page.locator(selectors.resetSubmit).click();
        await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();

        await page.locator(selectors.resetPassword).fill('Password@123');
        await page.locator(selectors.resetConfirm).fill('Mismatch@123');
        await page.locator(selectors.resetSubmit).click();
        await expect(page.locator('text=Passwords must match')).toBeVisible();
    });
});

// ─── 6. Session Timeout ───────────────────────────────────
test.describe('Session Timeout Handling', () => {
    test('TC-AUTH-29: redirects to login on 401 response', async ({ page }) => {
        // Intercept API call to return 401
        await page.route('**/api/**', route => route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Session expired' })
        }));

        // Go to dashboard securely with mock storage
        await page.goto(`${BASE}/login`, { waitUntil: 'load' });
        await page.evaluate(() => {
            localStorage.setItem('token', 'mock-expired-token');
            localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User', role: 'PATIENT' }));
        });

        // Trigger a 401 directly using the axios instance attached in the app, or simply via fetch since api.ts catches fetch?
        // Wait! api.ts (axios) is what has the interceptor.
        // We can just rely on the PatientDashboard rendering and fetching its stats.
        await page.goto(`${BASE}/dashboard/patient`, { waitUntil: 'load' });

        // Should be redirected to login due to stats API request failing with 401
        await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

        // Wait for removal logic
        await page.waitForTimeout(1000);

        // Verify local storage is cleared
        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeNull();
    });
});

// ─── 7. Lockout & Security ───────────────────────────────
test.describe('Lockout & Security', () => {
    test('TC-AUTH-30: handles 429 Too Many Requests (Lockout)', async ({ page }) => {
        // Mock a 429 response
        await page.route('**/api/auth/login', route => route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Too many failed login attempts. Account locked for 15 minutes.' })
        }));

        await page.goto(`${BASE}/login`);
        await page.locator(selectors.emailInput).fill('victim@test.com');
        await page.locator(selectors.passwordInput).fill('WrongPassword');
        await page.locator(selectors.submitBtn).click();

        // Verify toast message
        await expect(page.locator('text=Too many failed login attempts')).toBeVisible();
    });

    test('TC-AUTH-26: XSS in email field is safely handled', async ({ page }) => {
        await page.goto(`${BASE}/login`);
        await page.locator(selectors.emailInput).fill('<script>alert("xss")</script>');
        await page.locator(selectors.submitBtn).click();

        // Browser should NOT show an alert (Playwright would catch it)
        // And we should see validation error
        await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });
});

