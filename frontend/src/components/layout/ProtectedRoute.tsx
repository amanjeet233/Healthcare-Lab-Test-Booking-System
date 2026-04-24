import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
    allowedRoles?: Array<'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN'>;
}

const LOADING_TIMEOUT_MS = 5000; // 5 seconds max loading time

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, currentUser, isLoading } = useAuth();
    const location = useLocation();
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);

    // ✅ Failsafe: If loading takes too long, redirect to login
    useEffect(() => {
        if (!isLoading) {
            setLoadingTimedOut(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            if (isLoading) {
                console.warn("ProtectedRoute: Loading timed out, redirecting to login");
                setLoadingTimedOut(true);
            }
        }, LOADING_TIMEOUT_MS);

        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    // ✅ If loading timed out, show login page
    if (loadingTimedOut) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ✅ Show loading spinner only briefly
    if (isLoading) {
        return <LoadingSpinner fullScreen size="lg" />;
    }

    // Not logged in -> Redirect to login page and preserve their intended destination
    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role validation
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(currentUser.role as any)) {
            const role = currentUser.role;
            if (role === 'ADMIN') return <Navigate to="/admin" replace />;
            if (role === 'TECHNICIAN') return <Navigate to="/technician" replace />;
            if (role === 'MEDICAL_OFFICER') return <Navigate to="/medical-officer" replace />;
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
