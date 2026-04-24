import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/test-detail.css'
import App from './App.tsx'
import reportWebVitals from './reportWebVitals';
import { initSentry } from './utils/sentry';

// Initialize error tracking before React renders
initSentry();

// Prevent stale PWA cache/service-worker issues during local development.
if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  }).catch(() => undefined);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Measure Core Web Vitals and log to console
// To send to an analytics endpoint, replace console.log with a custom metric recorder API.
reportWebVitals(console.log);
