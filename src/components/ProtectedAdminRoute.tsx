import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const ProtectedAdminRoute = () => {
    const { isAdminLoggedIn, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">در حال بررسی دسترسی...</div>
            </div>
        );
    }

    return isAdminLoggedIn ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;
