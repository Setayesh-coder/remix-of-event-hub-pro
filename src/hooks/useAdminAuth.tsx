import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

    useEffect(() => {
        // هر بار که هوک لود می‌شه (مثل رفرش صفحه)، وضعیت رو از localStorage بخون
        const checkLoginStatus = () => {
            const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
            setIsAdminLoggedIn(loggedIn);
        };

        checkLoginStatus();

        // اگر localStorage تغییر کرد (مثل تب دیگه)، آپدیت کن
        window.addEventListener('storage', checkLoginStatus);

        return () => window.removeEventListener('storage', checkLoginStatus);
    }, []);

    const login = (username: string, password: string) => {
        if (
            username.trim() === import.meta.env.VITE_ADMIN_USERNAME &&
            password === import.meta.env.VITE_ADMIN_PASSWORD
        ) {
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