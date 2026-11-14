import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CatalogProvider } from './context/CatalogContext';
import { Layout } from './components/layout/Layout';
import { LanguageProvider } from './context/LanguageContext';

const HomePage = lazy(() => import('./pages/HomePage').then(({ HomePage }) => ({ default: HomePage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(({ AdminLoginPage }) => ({ default: AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(({ AdminDashboardPage }) => ({ default: AdminDashboardPage })));
const AdminAuditLogPage = lazy(() => import('./pages/AdminAuditLogPage').then(({ AdminAuditLogPage }) => ({ default: AdminAuditLogPage })));
const CatalogAdminPage = lazy(() => import('./pages/CatalogAdminPage').then(({ CatalogAdminPage }) => ({ default: CatalogAdminPage })));
const AdminOverviewPage = lazy(() => import('./pages/AdminOverviewPage').then(({ AdminOverviewPage }) => ({ default: AdminOverviewPage })));
const AdminCustomersPage = lazy(() => import('./pages/AdminCustomersPage').then(({ AdminCustomersPage }) => ({ default: AdminCustomersPage })));
const AdminDealsPage = lazy(() => import('./pages/AdminDealsPage').then(({ AdminDealsPage }) => ({ default: AdminDealsPage })));
const AdminTranslationsPage = lazy(() => import('./pages/AdminTranslationsPage').then(({ AdminTranslationsPage }) => ({ default: AdminTranslationsPage })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then(({ BookingsPage }) => ({ default: BookingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(({ ProfilePage }) => ({ default: ProfilePage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(({ NotificationsPage }) => ({ default: NotificationsPage })));
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage').then(({ CustomerDashboardPage }) => ({ default: CustomerDashboardPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(({ WishlistPage }) => ({ default: WishlistPage })));
const InfoPage = lazy(() => import('./pages/InfoPage').then(({ InfoPage }) => ({ default: InfoPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(({ LegalPage }) => ({ default: LegalPage })));

const ProtectedRoute = ({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) => {
  const { user, isAuthenticated, authReady } = useAuth();
  if (!authReady) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to={admin ? '/admin' : '/'} state={admin ? undefined : { openAuth: true, from: window.location.pathname }} replace />;
  }
  if (admin && user?.role !== 'admin') return <Navigate to="/" replace />;
  if (!admin && user?.role !== 'customer') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm font-semibold text-gray-500" role="status" aria-live="polite">
    Loading...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <CatalogProvider>
              <BookingProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
            {/* Public Routes with Mobile Layout */}
            <Route path="/" element={
              <Layout>
                <HomePage />
              </Layout>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute><Layout><BookingsPage /></Layout></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><CustomerDashboardPage /></Layout></ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute><Layout><WishlistPage /></Layout></ProtectedRoute>
            } />
            <Route path="/about" element={
              <Layout>
                <InfoPage kind="about" />
              </Layout>
            } />
            <Route path="/faq" element={
              <Layout>
                <InfoPage kind="faq" />
              </Layout>
            } />
            <Route path="/reviews" element={
              <Layout>
                <InfoPage kind="reviews" />
              </Layout>
            } />
            <Route path="/terms" element={<Layout><LegalPage kind="terms" /></Layout>} />
            <Route path="/privacy" element={<Layout><LegalPage kind="privacy" /></Layout>} />
            <Route path="/consumer-rights" element={<Layout><LegalPage kind="consumer" /></Layout>} />
            <Route path="/cookies" element={<Layout><LegalPage kind="cookies" /></Layout>} />

            {/* Admin Routes - Desktop optimized but accessible */}
             <Route path="/admin" element={
               <AdminLoginPage />
             } />
            <Route path="/admin/login" element={<Navigate to="/admin" replace />} />

            <Route path="/account" element={<Navigate to="/" replace state={{ openAuth: true, from: '/' }} />} />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute admin>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/overview" element={
              <ProtectedRoute admin>
                <AdminOverviewPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-log" element={
              <ProtectedRoute admin>
                <AdminAuditLogPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/catalog" element={
              <ProtectedRoute admin>
                <CatalogAdminPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute admin>
                <AdminCustomersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/deals" element={
              <ProtectedRoute admin>
                <AdminDealsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/translations" element={
              <ProtectedRoute admin>
                <AdminTranslationsPage />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
              </BookingProvider>
            </CatalogProvider>
          </WishlistProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
