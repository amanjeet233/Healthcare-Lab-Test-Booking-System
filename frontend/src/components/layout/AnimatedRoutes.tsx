import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import ProtectedRoute from './ProtectedRoute';
import PageTransition from '../common/PageTransition';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

const lazyWithRetry = <T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem('lazy-retry-triggered');
      return module;
    } catch (error) {
      const message = String((error as Error)?.message || error);
      const isDynamicImportFailure =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed');

      if (isDynamicImportFailure && !sessionStorage.getItem('lazy-retry-triggered')) {
        sessionStorage.setItem('lazy-retry-triggered', '1');
        window.location.reload();
      }

      throw error;
    }
  });

// Lazy-loaded pages
// Auth views are now handled via AuthModal
const LandingPage = lazy(() => import('../../pages/LandingPage'));
const TestListingPage = lazy(() => import('../../pages/TestListingPage'));
const TestDetailPage = lazy(() => import('../../pages/TestDetailPage'));
const CartPage = lazy(() => import('../../pages/CartPage'));
const PackagesListingPage = lazy(() => import('../../pages/packages/PackagesListingPage'));
const PackageDetailPage = lazy(() => import('../../pages/packages/PackageDetailPage'));
const BookingPage = lazyWithRetry(() => import('../../pages/patient/BookingPage'));
const MyBookingsPage = lazyWithRetry(() => import('../../pages/patient/MyBookingsPage'));
const ReportsPage = lazy(() => import('../../pages/patient/ReportsPage'));
const SettingsPage = lazy(() => import('../../pages/patient/SettingsPage'));
const PromotionsPage = lazy(() => import('../../pages/PromotionsPage'));
const ProfilePage = lazy(() => import('../../pages/patient/ProfilePage'));
const NotificationCenter = lazy(() => import('../../pages/patient/NotificationCenter'));
const AdminNotificationCenterPage = lazy(() => import('../../pages/admin/AdminNotificationCenterPage'));
const TechnicianNotificationCenterPage = lazy(() => import('../../pages/technician/TechnicianNotificationCenterPage'));
const MedicalOfficerNotificationCenterPage = lazy(() => import('../../pages/medical/MedicalOfficerNotificationCenterPage'));
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const AdminBookingsPage = lazy(() => import('../../pages/admin/AdminBookingsPage'));
const AdminUsersPage = lazy(() => import('../../pages/admin/AdminUsersPage'));
const AdminStaffPage = lazy(() => import('../../pages/admin/AdminStaffPage'));
const AdminProfilePage = lazy(() => import('../../pages/admin/AdminProfilePage'));
const DoctorManagementPage = lazy(() => import('../../pages/admin/DoctorManagementPage'));
const ReferenceRangesPage = lazy(() => import('../../pages/admin/ReferenceRangesPage'));
const TestParametersPage = lazy(() => import('../../pages/admin/TestParametersPage'));
const BookConsultationPage = lazy(() => import('../../pages/patient/BookConsultationPage'));
const FamilyMembersPage = lazy(() => import('../../pages/patient/FamilyMembersPage'));
const AddressBookPage = lazy(() => import('../../pages/patient/AddressBookPage'));
const SmartReportsPage = lazy(() => import('../../pages/patient/SmartReportsPage'));
const HealthInsightsPage = lazy(() => import('../../pages/patient/HealthInsightsPage'));
const HealthOptimizationPage = lazy(() => import('../../pages/patient/HealthOptimizationPage'));
const LabPartnerPage = lazy(() => import('../../pages/LabPartnerPage'));
const AuditLogsPage = lazy(() => import('../../pages/admin/AuditLogsPage'));
const PromoCodesPage = lazy(() => import('../../pages/admin/PromoCodesPage'));
const CategoryListingPage = lazy(() => import('../../pages/CategoryListingPage'));
const TestListingBySlugPage = lazy(() => import('../../pages/TestListingBySlugPage'));
const WomenWellnessPage = lazy(() => import('../../pages/WomenWellnessPage'));
const ScreeningsPage = lazy(() => import('../../pages/ScreeningsPage'));
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const TechnicianDashboardPage = lazy(() => import('../../pages/technician/TechnicianDashboardPage'));
const TechnicianTodayPage = lazy(() => import('../../pages/technician/TechnicianTodayPage'));
const TechnicianQueuePage = lazy(() => import('../../pages/technician/TechnicianQueuePage'));
const TechnicianInLabPage = lazy(() => import('../../pages/technician/TechnicianInLabPage'));
const TechnicianCollectedPage = lazy(() => import('../../pages/technician/TechnicianCollectedPage'));
const TechnicianProfilePage = lazy(() => import('../../pages/technician/TechnicianProfilePage'));
const TechnicianResultEntryPage = lazy(() => import('../../pages/technician/TechnicianResultEntryPage'));
const MedicalOfficerDashboardPage = lazy(() => import('../../pages/medical/MedicalOfficerDashboardPage'));
const MedicalOfficerVerificationPage = lazy(() => import('../../pages/medical/MedicalOfficerVerificationPage'));
const MedicalOfficerHistoryPage = lazy(() => import('../../pages/medical/MedicalOfficerHistoryPage'));
const MedicalOfficerBookingDetailsPage = lazy(() => import('../../pages/medical/MedicalOfficerBookingDetailsPage'));
const MedicalOfficerAssignmentsPage = lazy(() => import('../../pages/medical/MedicalOfficerAssignmentsPage'));
const MedicalOfficerPipelinePage = lazy(() => import('../../pages/medical/MedicalOfficerPipelinePage'));
const MedicalOfficerProfilePage = lazy(() => import('../../pages/medical/MedicalOfficerProfilePage'));
const PublicReportView = lazy(() => import('../../pages/public/PublicReportView'));
const ReportPrintPage = lazy(() => import('../../pages/patient/ReportPrintPage'));

import MainLayout from './MainLayout';

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    const { currentUser, isAuthenticated } = useAuth();

    const HomeRoute: React.FC = () => {
        const role = currentUser?.role;
        if (isAuthenticated && role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (isAuthenticated && role === 'TECHNICIAN') return <Navigate to="/technician" replace />;
        if (isAuthenticated && role === 'MEDICAL_OFFICER') return <Navigate to="/medical-officer" replace />;
        return <LandingPage />;
    };

    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                    <Route path="/register" element={<PageTransition><LoginPage /></PageTransition>} />
                    <Route path="/forgot-password" element={<Navigate to="/" replace />} />
                    <Route path="/reset-password" element={<Navigate to="/" replace />} />

                    {/* Unified Platform Pages (with persistent header/footer) */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<PageTransition><HomeRoute /></PageTransition>} />
                        {/* ── Lab Tests routes (MedSync style) ── */}
                        {/* Specific routes MUST come before dynamic :slug routes */}
                        <Route path="/lab-tests" element={<PageTransition><TestListingPage /></PageTransition>} />
                        <Route path="/lab-tests/all-lab-tests" element={<PageTransition><TestListingBySlugPage slugOverride="all-lab-tests" /></PageTransition>} />
                        <Route path="/category-listing/:slug" element={<PageTransition><CategoryListingPage /></PageTransition>} />
                        {/* Specific /test-listing/ routes BEFORE the wildcard */}
                        <Route path="/test-listing/popular-health-checkup-packages" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/test-listing/women-wellness" element={<PageTransition><WomenWellnessPage /></PageTransition>} />
                        <Route path="/test-listing/top-booked-tests" element={<PageTransition><TestListingBySlugPage /></PageTransition>} />
                        {/* Dynamic wildcard LAST */}
                        <Route path="/test-listing/:slug" element={<PageTransition><TestListingBySlugPage /></PageTransition>} />
                        <Route path="/lab-tests-category/:categorySlug" element={<PageTransition><TestListingBySlugPage /></PageTransition>} />

                        <Route path="/tests" element={<Navigate to="/lab-tests" replace />} />
                        <Route path="/screenings" element={<PageTransition><ScreeningsPage /></PageTransition>} />
                        <Route path="/test/:slug" element={<PageTransition><TestDetailPage /></PageTransition>} />
                        <Route path="/packages" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/packages/category/:pathCategory" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/packages/tier/:pathTier" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/packages/:slug" element={<PageTransition><PackageDetailPage /></PageTransition>} />

                        {/* Public Pages - No auth required */}
                        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />

                        {/* Protected Unified Pages */}
                        {/* Admin only */}
                        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                            <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
                          <Route path="/admin/bookings" element={<PageTransition><AdminBookingsPage /></PageTransition>} />
                          <Route path="/admin/users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
                          <Route path="/admin/staff" element={<PageTransition><AdminStaffPage /></PageTransition>} />
                          <Route path="/admin/profile" element={<PageTransition><AdminProfilePage /></PageTransition>} />
                            <Route path="/admin/audit-logs" element={<PageTransition><AuditLogsPage /></PageTransition>} />
                          <Route path="/admin/promo-codes" element={<PageTransition><PromoCodesPage /></PageTransition>} />
                          <Route path="/admin/promos" element={<PageTransition><PromoCodesPage /></PageTransition>} />
                          <Route path="/admin/notifications" element={<PageTransition><AdminNotificationCenterPage /></PageTransition>} />
                            <Route path="/admin/doctor-management" element={<PageTransition><DoctorManagementPage /></PageTransition>} />
                            <Route path="/admin/reference-ranges" element={<PageTransition><ReferenceRangesPage /></PageTransition>} />
                            <Route path="/admin/test-parameters" element={<PageTransition><TestParametersPage /></PageTransition>} />
                        </Route>

                        {/* Technician only */}
                        <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
                            <Route path="/technician" element={<PageTransition><TechnicianDashboardPage /></PageTransition>} />
                          <Route path="/technician/today" element={<PageTransition><TechnicianTodayPage /></PageTransition>} />
                          <Route path="/technician/queue" element={<PageTransition><TechnicianQueuePage /></PageTransition>} />
                          <Route path="/technician/inlab" element={<PageTransition><TechnicianInLabPage /></PageTransition>} />
                          <Route path="/technician/in-lab" element={<Navigate to="/technician/inlab" replace />} />
                          <Route path="/technician/collected" element={<PageTransition><TechnicianCollectedPage /></PageTransition>} />
                          <Route path="/technician/results/:bookingId" element={<PageTransition><TechnicianResultEntryPage /></PageTransition>} />
                          <Route path="/technician/notifications" element={<PageTransition><TechnicianNotificationCenterPage /></PageTransition>} />
                          <Route path="/technician/profile" element={<PageTransition><TechnicianProfilePage /></PageTransition>} />
                        </Route>

                        {/* Medical Officer only */}
                        <Route element={<ProtectedRoute allowedRoles={['MEDICAL_OFFICER']} />}>
                            <Route path="/medical-officer" element={<PageTransition><MedicalOfficerDashboardPage /></PageTransition>} />
                          <Route path="/medical-officer/verification" element={<PageTransition><MedicalOfficerVerificationPage /></PageTransition>} />
                          <Route path="/medical-officer/history" element={<PageTransition><MedicalOfficerHistoryPage /></PageTransition>} />
                          <Route path="/medical-officer/bookings/:bookingId" element={<PageTransition><MedicalOfficerBookingDetailsPage /></PageTransition>} />
                          <Route path="/medical-officer/assignments" element={<PageTransition><MedicalOfficerAssignmentsPage /></PageTransition>} />
                          <Route path="/medical-officer/pipeline" element={<PageTransition><MedicalOfficerPipelinePage /></PageTransition>} />
                          <Route path="/medical-officer/notifications" element={<PageTransition><MedicalOfficerNotificationCenterPage /></PageTransition>} />
                          <Route path="/medical-officer/profile" element={<PageTransition><MedicalOfficerProfilePage /></PageTransition>} />
                        </Route>

                        {/* Patient + Admin (shared protected routes) */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/booking" element={<PageTransition><BookingPage /></PageTransition>} />
                            <Route path="/booking/:id" element={<PageTransition><BookingPage /></PageTransition>} />
                            <Route path="/my-bookings" element={<PageTransition><MyBookingsPage /></PageTransition>} />
                            <Route path="/bookings" element={<Navigate to="/my-bookings" replace />} />
                            <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                            <Route path="/family-members" element={<PageTransition><FamilyMembersPage /></PageTransition>} />
                            <Route path="/my-addresses" element={<PageTransition><AddressBookPage /></PageTransition>} />
                            <Route path="/health-insights" element={<PageTransition><HealthInsightsPage /></PageTransition>} />
                            <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
                            <Route path="/promotions" element={<PageTransition><PromotionsPage /></PageTransition>} />
                            <Route path="/lab-partners" element={<PageTransition><LabPartnerPage /></PageTransition>} />
                            <Route path="/notifications" element={<PageTransition><NotificationCenter /></PageTransition>} />
                            <Route path="/book-consultation" element={<PageTransition><BookConsultationPage /></PageTransition>} />
                            <Route path="/reports" element={<PageTransition><ReportsPage /></PageTransition>} />
                            <Route path="/smart-reports/:bookingId?" element={<PageTransition><SmartReportsPage /></PageTransition>} />
                            <Route path="/reports/:bookingId/print" element={<ReportPrintPage />} />
                            <Route path="/health-optimization" element={<Navigate to="/health-plan/new" replace />} />
                            <Route path="/health-optimization/:bookingId" element={<PageTransition><HealthOptimizationPage /></PageTransition>} />
                            <Route path="/health-plan/:bookingId" element={<PageTransition><HealthOptimizationPage /></PageTransition>} />
                            <Route path="/my-reports" element={<Navigate to="/reports" replace />} />
                            <Route path="/promos" element={<PageTransition><PromoCodesPage /></PageTransition>} />
                        </Route>
                    </Route>

                    {/* All legacy /dashboard routes are now integrated into the Landing Page SPA experience */}
                    <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
                    <Route path="/public/view-report/:token" element={<PageTransition><PublicReportView /></PageTransition>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
};

export default AnimatedRoutes;
