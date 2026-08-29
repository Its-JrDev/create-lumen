import { Navigate } from 'react-router-dom';

export function RoleGuard({ children, roles = ['admin'], userRole = 'admin' }) {
  if (!roles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}