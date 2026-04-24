import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider } from './context/NotificationContext';
import { ComparisonProvider } from './context/ComparisonContext';
import AppModal from './components/common/AppModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import AnimatedRoutes from './components/layout/AnimatedRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import ComparisonPanel from './components/ComparisonPanel';
import CartDrawer from './components/cart/CartDrawer';
import GlobalOverlays from './components/ui/GlobalOverlays';
import { CartProvider } from './context/CartContext';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

function App() {
  // Global offline indicator
  useEffect(() => {
    const handleOnline = () => {
      toast.success("Connection restored! You're back online.", { id: 'network-status' });
    };

    const handleOffline = () => {
      toast.error("You are currently offline. Check your network connection.", { id: 'network-status', duration: Infinity });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <ModalProvider>
              <ComparisonProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <div className="App w-full overflow-x-hidden min-h-screen bg-transparent dark:bg-gray-900 flex flex-col font-sans">
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#333',
                          color: '#fff',
                        },
                        success: {
                          style: {
                            background: '#10B981', // Tailwind success
                          },
                        },
                        error: {
                          style: {
                            background: '#EF4444', // Tailwind danger
                          },
                        },
                      }}
                    />
                    <AnimatedRoutes />
                    <AppModal />
                    <ComparisonPanel />
                    <CartDrawer />
                    <GlobalOverlays />
                  </div>
                </BrowserRouter>
              </ComparisonProvider>
            </ModalProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
