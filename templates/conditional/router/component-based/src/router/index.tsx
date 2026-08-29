import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/Home';
import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: (
          <GuestGuard>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Login</h1>
              <p style={{ color: 'var(--color-muted)' }}>Public route — a page only for guests.</p>
            </div>
          </GuestGuard>
        ),
      },
      {
        path: 'admin',
        element: (
          <AuthGuard>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Protected Page</h1>
              <p style={{ color: 'var(--color-muted)' }}>Accessible to authenticated users.</p>
            </div>
          </AuthGuard>
        ),
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}