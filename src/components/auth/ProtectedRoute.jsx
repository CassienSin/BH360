import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import LoadingScreen from '../common/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Wait for Firebase auth state to resolve before redirecting
  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
