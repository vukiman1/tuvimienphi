import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import { useAuthBootstrap } from '@/features/auth/use-auth-bootstrap';
import { queryClient } from '@/lib/query-client';
import { AppToastContainer } from './app-toast-container';
import { router } from './router';

export function App() {
  useAuthBootstrap();
  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <RouterProvider router={router} />
      </ConfirmProvider>
      <AppToastContainer />
    </QueryClientProvider>
  );
}

export default App;
