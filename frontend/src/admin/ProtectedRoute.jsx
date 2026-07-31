import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';

export default function ProtectedRoute() {
  const { authenticated, checkingAuth } = useAuth();

  if (checkingAuth) {
    return <Loader label="Checking session…" />;
  }

  if (!authenticated) {
    return <Navigate to="/admin-panel/login" replace />;
  }

  return <Outlet />;
}
