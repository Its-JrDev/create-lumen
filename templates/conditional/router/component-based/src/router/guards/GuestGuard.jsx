import { Navigate } from 'react-router-dom';

export function GuestGuard({ children, isAuthenticated = false }) {
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}