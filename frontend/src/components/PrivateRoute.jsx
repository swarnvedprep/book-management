import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return <Outlet />;
};
