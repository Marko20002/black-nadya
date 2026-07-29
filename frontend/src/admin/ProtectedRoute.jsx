import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <Navigate to="/admin-panel/login" replace />;
  }

  return <Outlet />;
}
