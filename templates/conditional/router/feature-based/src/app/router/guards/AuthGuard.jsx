import { Navigate } from 'react-router-dom';

export function AuthGuard({ children, isAuthenticated = true }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}