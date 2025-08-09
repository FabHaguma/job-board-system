import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, adminRequired = false }) {
  // Derive authentication instead of relying on a missing isAuthenticated flag
  const { user, token } = useSelector(state => state.auth);
  const isAuthenticated = !!user && !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminRequired && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
