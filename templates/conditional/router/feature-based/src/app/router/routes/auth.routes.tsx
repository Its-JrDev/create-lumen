import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';

export const authRoutes = [
  {
    path: 'admin',
    element: (
      <AuthGuard>
        <RoleGuard>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Protected Page</h1>
            <p style={{ color: 'var(--color-muted)' }}>Accessible to authenticated admin users.</p>
          </div>
        </RoleGuard>
      </AuthGuard>
    ),
  },
];