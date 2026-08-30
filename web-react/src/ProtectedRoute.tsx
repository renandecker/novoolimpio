import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from './features/auth/auth';
import AppLayout from './shared/components/AppLayout';

export default function ProtectedRoute() {
    const {session} = useAuth();
    const location = useLocation();
    return session ? <AppLayout><Outlet/></AppLayout> :
        <Navigate to="/login" state={{from: location.pathname}} replace/>;
}