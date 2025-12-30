import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useState, useEffect } from 'react';

const ProtectedAdminRoute = () => {
    const { isAdminLoggedIn } = useAdminAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // یه تأخیر کوچیک (100ms) بده تا state کامل آپدیت بشه
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [isAdminLoggedIn]);

    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center">در حال بررسی...</div>;
    }

    return isAdminLoggedIn ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;