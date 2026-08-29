import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/shared/layouts/RootLayout';
import { authRoutes } from './routes/auth.routes';
import { homeRoutes } from './routes/home.routes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [...homeRoutes, ...authRoutes],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}