import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const location = useLocation();
  const { booting, isAuthenticated } = useAuth();

  if (booting) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface text-sm text-steel">
        Loading secure workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
