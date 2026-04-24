import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import toast from 'react-hot-toast';

// ✅ Use correct base URL - NO /api suffix, endpoints will have /api
const api = axios.create({
    // Prefer same-origin/proxy in dev to avoid CORS/network issues on cart actions.
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true  // ✅ Enable credentials for CORS
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let isLoggingOut = false;  // ✅ Prevent infinite logout loop
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ✅ Global logout handler - only runs ONCE
const handleGlobalLogout = (showToast = true) => {
    if (isLoggingOut) return; // Already logging out, skip
    isLoggingOut = true;

    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Also clear all healthlab.* cached data so users don't share carts/bookings
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('healthlab.')) {
            localStorage.removeItem(key);
        }
    });

    // ✅ Dispatch custom event so React components can sync state
    window.dispatchEvent(new CustomEvent('auth:logout'));

    // Show toast only once
    if (showToast) {
        toast.error("Session expired. Please log in again.");
    }

    // Redirect to login page (use replace to prevent back navigation loop)
    setTimeout(() => {
        isLoggingOut = false; // Reset flag after redirect
        window.location.replace('/login');
    }, 100);
};

// ✅ Export for use in other components
export { handleGlobalLogout };

// Refresh token helper
const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return null;
    }

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/refresh-token`,
            { refreshToken }
        );
        const newToken = response.data?.data?.accessToken || response.data?.accessToken;
        if (newToken) {
            localStorage.setItem('token', newToken);
            // Also update refresh token if provided
            const newRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            return newToken;
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Configure Axios Retry globally:
axiosRetry(api, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error: AxiosError) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
    },
    onRetry: (retryCount: number, error: AxiosError, requestConfig: AxiosRequestConfig) => {
        if (import.meta.env.DEV) {
            console.warn(`[API Retry] #${retryCount} for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, error.message);
        }
    }
});

// Request Interceptor: Attach JWT Token & Log requests in Dev
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // ✅ Skip requests if we're logging out (prevents loop)
        if (isLoggingOut) {
            return Promise.reject(new axios.Cancel('Logging out, request cancelled'));
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }

        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401s with token refresh & Log responses in Dev
api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} => ${response.status}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        if (import.meta.env.DEV && error.response) {
            console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} => ${error.response?.status}`, error.response?.data);
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _rateLimitRetries?: number };

        // ✅ Handle 429 Rate Limit - Exponential backoff with retry
        if (error.response?.status === 429) {
            const retryCount = (originalRequest._rateLimitRetries || 0) + 1;
            const maxRetries = 3;

            if (retryCount <= maxRetries) {
                const backoffTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s exponential backoff

                if (import.meta.env.DEV) {
                    console.warn(`[Rate Limited] Retry #${retryCount} after ${backoffTime}ms for ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
                }

                // Show toast only on first rate limit
                if (retryCount === 1) {
                    toast.error("⚠️ Rate limited. Retrying in a moment...");
                }

                return new Promise((resolve) => {
                    setTimeout(() => {
                        originalRequest._rateLimitRetries = retryCount;
                        resolve(api(originalRequest));
                    }, backoffTime);
                });
            } else {
                console.error(`[Rate Limited] Max retries (${maxRetries}) exceeded`);
                toast.error("❌ Too many requests. Please try again later.");
                return Promise.reject(error);
            }
        }

        // Handle 401 with token refresh
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // ✅ Skip if already logging out
            if (isLoggingOut) {
                return Promise.reject(error);
            }

            // Don't try to refresh if this was the login/register/refresh request itself
            if (originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/register') ||
                originalRequest.url?.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            // ✅ Check if we have a token to refresh
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
                // No token, just reject without triggering logout loop
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue the request while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (token) {
                        originalRequest.headers.set('Authorization', `Bearer ${token}`);
                    }
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    processQueue(null, newToken);
                    originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                    return api(originalRequest);
                } else {
                    // Refresh failed, use global logout handler (runs only ONCE)
                    processQueue(new Error('Refresh token failed'), null);
                    handleGlobalLogout(true);
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                handleGlobalLogout(true);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// --- CACHING LOGIC ---
const cache = new Map<string, { data: any; ts: number }>();

/**
 * Enhanced GET request with in-memory caching
 * @param url The endpoint URL
 * @param config Optional Axios request config
 * @param ttl Time to live in milliseconds (default 1 minute)
 */
export const cachedGet = async (url: string, config?: AxiosRequestConfig, ttl = 60000): Promise<AxiosResponse> => {
    // Basic cache key: URL + stringified params
    const key = `${url}${config?.params ? JSON.stringify(config.params) : ''}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.ts < ttl) {
        if (import.meta.env.DEV) {
            console.log(`[API Cache Hit] ${url}`);
        }
        return { data: cached.data } as AxiosResponse;
    }

    const response = await api.get(url, config);
    cache.set(key, { data: response.data, ts: Date.now() });
    return response;
};

export default api;
