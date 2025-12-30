import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('adminLoggedIn');
        if (stored === 'true') {
            setIsAdminLoggedIn(true);
        }
    }, []);

    const login = (username: string, password: string) => {
        if (username === import.meta.env.VITE_ADMIN_USERNAME && password === import.meta.env.VITE_ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            setIsAdminLoggedIn(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('adminLoggedIn');
        setIsAdminLoggedIn(false);
    };

    return { isAdminLoggedIn, login, logout };
};