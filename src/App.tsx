import AdminPage from './components/AdminPage';
import HomePage from './components/HomePage';

export default function App() {
  return window.location.pathname.replace(/\/$/, '') === '/admin' ? <AdminPage /> : <HomePage />;
}
