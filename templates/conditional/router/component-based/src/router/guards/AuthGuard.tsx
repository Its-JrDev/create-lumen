import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
  isAuthenticated?: boolean;
}

export function AuthGuard({ children, isAuthenticated = true }: AuthGuardProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}