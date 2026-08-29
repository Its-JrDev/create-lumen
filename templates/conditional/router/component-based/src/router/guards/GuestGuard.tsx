import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface GuestGuardProps {
  children: ReactNode;
  isAuthenticated?: boolean;
}

export function GuestGuard({ children, isAuthenticated = false }: GuestGuardProps) {
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}