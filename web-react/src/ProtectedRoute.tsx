import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import AppLayout from './AppLayout';
export default function ProtectedRoute() { const { session } = useAuth(); const location = useLocation(); return session ? <AppLayout><Outlet /></AppLayout> : <Navigate to="/login" state={{ from: location.pathname }} replace />; }