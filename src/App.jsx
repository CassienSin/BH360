import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme/theme';
import { store } from './store';
import { queryClient } from './api/queryClient';
import { useAuthPersistence } from './hooks/useAuthPersistence';
import './styles/globals.scss';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import IncidentList from './pages/Incidents/IncidentList';
import IncidentDetails from './pages/Incidents/IncidentDetails';
import IncidentCreate from './pages/Incidents/IncidentCreate';
import TanodManagement from './pages/Tanod/TanodManagement';
import TaskManagement from './pages/Tanod/TaskManagement';
import UserManagement from './pages/Users/UserManagement';
import AIHelpDesk from './pages/HelpDesk/AIHelpDesk';
import TicketManagement from './pages/HelpDesk/TicketManagement';
import Announcements from './pages/Announcements/Announcements';
import Analytics from './pages/Analytics/Analytics';
import Profile from './pages/Profile/Profile';

// Create emotion cache with prepend for MUI styles
const createEmotionCache = () => {
  return createCache({
    key: 'mui',
    prepend: true,
  });
};

const emotionCache = createEmotionCache();

// Auth persistence component
const AppContent = () => {
  useAuthPersistence();

  return (
    <>
      <Router>
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
      </Router>
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
