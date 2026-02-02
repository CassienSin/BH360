import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme/theme';
import { store } from './store';
import { queryClient } from './api/queryClient';
import { useAuthPersistence } from './hooks/useAuthPersistence';
import './styles/globals.scss';

// Layouts (keep these as they're always needed)
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Guards (keep these as they're always needed)
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const IncidentList = lazy(() => import('./pages/Incidents/IncidentList'));
const IncidentDetails = lazy(() => import('./pages/Incidents/IncidentDetails'));
const IncidentCreate = lazy(() => import('./pages/Incidents/IncidentCreate'));
const TanodManagement = lazy(() => import('./pages/Tanod/TanodManagement'));
const TaskManagement = lazy(() => import('./pages/Tanod/TaskManagement'));
const PerformanceInsights = lazy(() => import('./pages/Tanod/PerformanceInsights'));
const UserManagement = lazy(() => import('./pages/Users/UserManagement'));
const AIHelpDesk = lazy(() => import('./pages/HelpDesk/AIHelpDesk'));
const TicketManagement = lazy(() => import('./pages/HelpDesk/TicketManagement'));
const Announcements = lazy(() => import('./pages/Announcements/Announcements'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Profile = lazy(() => import('./pages/Profile/Profile'));

// Create emotion cache with prepend for MUI styles
const createEmotionCache = () => {
  return createCache({
    key: 'mui',
    prepend: true,
  });
};

const emotionCache = createEmotionCache();

// Loading fallback component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 50%, #FECDD3 100%)',
    }}
  >
    <CircularProgress size={48} />
  </Box>
);

// Auth persistence component
const AppContent = () => {
  useAuthPersistence();

  return (
    <>
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/create" element={<IncidentCreate />} />
            <Route path="/incidents/:id" element={<IncidentDetails />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/tanod" element={<TanodManagement />} />
            <Route path="/tanod/performance" element={<PerformanceInsights />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/helpdesk" element={<AIHelpDesk />} />
            <Route path="/tickets" element={<TicketManagement />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 - Redirect to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
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
    </>
  );
};

function App() {
  return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppContent />
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </CacheProvider>
  );
}

export default App;
