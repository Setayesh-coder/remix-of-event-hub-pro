import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const ProtectedAdminRoute = () => {
    const { isAdminLoggedIn } = useAdminAuth();
    return isAdminLoggedIn ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default ProtectedAdminRoute;