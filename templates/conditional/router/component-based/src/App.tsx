import { AppProvider } from '@/providers/AppProvider';
import { AppRoutes } from '@/router';

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
