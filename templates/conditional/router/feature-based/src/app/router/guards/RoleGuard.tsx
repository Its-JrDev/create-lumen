import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: ReactNode;
  roles?: string[];
  userRole?: string;
}

export function RoleGuard({ children, roles = ['admin'], userRole = 'admin' }: RoleGuardProps) {
  if (!roles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}