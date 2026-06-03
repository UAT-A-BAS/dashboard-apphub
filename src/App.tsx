import { lazy, Suspense } from 'react';
import HomePage from './components/HomePage';

const AdminPage = lazy(() => import('./components/AdminPage'));

export default function App() {
  return window.location.pathname.replace(/\/$/, '') === '/admin' ? (
    <Suspense fallback={<div className="min-h-dvh bg-slate-950" />}>
      <AdminPage />
    </Suspense>
  ) : (
    <HomePage />
  );
}
