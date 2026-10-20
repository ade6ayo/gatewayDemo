import { lazy, Suspense } from 'react';
import { AdminGuard } from '../components/ui/AdminGuard';

const AdminConsole = lazy(() => import('../components/admin/AdminConsole'));

export function AdminPage() {
  return (
    <AdminGuard>
      <Suspense fallback={<main className="admin-console">Loading admin console...</main>}>
        <AdminConsole />
      </Suspense>
    </AdminGuard>
  );
}
