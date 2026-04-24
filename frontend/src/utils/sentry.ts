/**
 * Sentry Error Tracking Initialization
 *
 * This module initializes Sentry for error tracking in production/staging environments.
 * Set VITE_SENTRY_DSN in your .env file to enable error reporting.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/react/
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

interface SentryModule {
    init: (options: {
        dsn: string;
        environment: string;
        tracesSampleRate: number;
        ignoreErrors: string[];
    }) => void;
}

export function initSentry(): void {
    if (!SENTRY_DSN) {
        if (import.meta.env.DEV) {
            console.info('[Sentry] No DSN configured — error tracking disabled.');
        }
        return;
    }

    // Use a variable so TypeScript doesn't try to resolve the module at compile time.
    const sentryModulePath = '@sentry/react';

    import(/* @vite-ignore */ sentryModulePath).then((Sentry: SentryModule) => {
        Sentry.init({
            dsn: SENTRY_DSN,
            environment: APP_ENV,
            tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
            ignoreErrors: [
                'ResizeObserver loop limit exceeded',
                'ResizeObserver loop completed with undelivered notifications',
                'Network Error',
            ],
        });

        if (import.meta.env.DEV) {
            console.info(`[Sentry] Initialized for environment: ${APP_ENV}`);
        }
    }).catch(() => {
        console.warn('[Sentry] SDK not installed — skipping error tracking. Install with: npm i @sentry/react');
    });
}
