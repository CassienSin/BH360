import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
