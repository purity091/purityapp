import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';

const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(({ AdminLoginPage }) => ({ default: AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(({ AdminDashboardPage }) => ({ default: AdminDashboardPage })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then(({ BookingsPage }) => ({ default: BookingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(({ ProfilePage }) => ({ default: ProfilePage })));
const InfoPage = lazy(() => import('./pages/InfoPage').then(({ InfoPage }) => ({ default: InfoPage })));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
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
      <AuthProvider>
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
              <Layout>
                <BookingsPage />
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <ProfilePage />
              </Layout>
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

            {/* Admin Routes - Desktop optimized but accessible */}
            <Route path="/admin" element={
              <AdminLoginPage />
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
