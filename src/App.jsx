import { lazy, Suspense, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { buildTheme } from './theme/theme';
import { store } from './store';
import { queryClient } from './api/queryClient';
import { useAppearanceSettings } from './hooks/useSettings';
import { useNotificationSync, useBrowserNotificationPermission } from './hooks/useNotifications';
import { DEFAULTS } from './services/settingsService';
import { useAuthPersistence } from './hooks/useAuthPersistence';
import { LanguageProvider } from './context/LanguageContext';
import { ROLE_CAPTAIN, ROLE_KAGAWAD, ROLE_SECRETARY, ROLE_TANOD } from './config/roles';
import './styles/globals.scss';

// Layouts (keep these as they're always needed)
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Guards (keep these as they're always needed)
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'));
const IncidentList = lazy(() => import('./pages/Incidents/IncidentList'));
const IncidentDetails = lazy(() => import('./pages/Incidents/IncidentDetails'));
const IncidentCreate = lazy(() => import('./pages/Incidents/IncidentCreate'));
const TanodManagement = lazy(() => import('./pages/Tanod/TanodManagement'));
const TaskManagement = lazy(() => import('./pages/Tanod/TaskManagement'));
const FalseReportTasks = lazy(() => import('./pages/Tanod/FalseReportTasks'));
const MySchedulePage = lazy(() => import('./pages/Tanod/MySchedulePage'));
const PerformanceInsights = lazy(() => import('./pages/Tanod/PerformanceInsights'));
const UserManagement = lazy(() => import('./pages/Users/UserManagement'));
const FalseReportManagement = lazy(() => import('./pages/Users/FalseReportManagement'));
const AIHelpDesk = lazy(() => import('./pages/HelpDesk/AIHelpDesk'));
const TicketManagement = lazy(() => import('./pages/HelpDesk/TicketManagement'));
const Announcements = lazy(() => import('./pages/Announcements/Announcements'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Profile  = lazy(() => import('./pages/Profile/Profile'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));

// Create emotion cache with prepend for MUI styles
const createEmotionCache = () => {
  return createCache({
    key: 'mui',
    prepend: true,
  });
};

const emotionCache = createEmotionCache();

// Loading fallback component
const PageLoader = () => <LoadingScreen message="Loading page..." />;

// Auth persistence component
const AppContent = () => {
  useAuthPersistence();
  useNotificationSync();
  useBrowserNotificationPermission();
  const { data: appearanceSettings } = useAppearanceSettings();
  const activeTheme = useMemo(
    () => buildTheme(appearanceSettings ?? DEFAULTS.appearance),
    [appearanceSettings],
  );

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <LanguageProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Default Route - Redirect to Login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
              </Route>

              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[ROLE_CAPTAIN, ROLE_KAGAWAD, ROLE_SECRETARY, ROLE_TANOD]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/incidents" element={<IncidentList />} />
                <Route path="/incidents/create" element={<IncidentCreate />} />
                <Route path="/incidents/:id" element={<IncidentDetails />} />
                <Route path="/tasks" element={<TaskManagement />} />
                <Route path="/tasks/false-reports" element={<FalseReportTasks />} />
                <Route path="/schedule" element={<MySchedulePage />} />
                <Route path="/tanod" element={<TanodManagement />} />
                <Route path="/tanod/performance" element={<PerformanceInsights />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/users/blacklist" element={<FalseReportManagement />} />
                <Route path="/helpdesk" element={<AIHelpDesk />} />
                <Route path="/tickets" element={<TicketManagement />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile"   element={<Profile />} />
                <Route path="/settings"  element={<Settings />} />
              </Route>

              {/* 404 - Redirect to Login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </LanguageProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </Provider>
    </CacheProvider>
  );
}

export default App;
