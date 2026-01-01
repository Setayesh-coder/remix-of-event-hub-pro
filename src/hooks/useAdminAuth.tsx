import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminAuth = () => {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const checkAdminStatus = async (currentUser: User | null) => {
            if (!currentUser) {
                setIsAdminLoggedIn(false);
                setUser(null);
                setLoading(false);
                return;
            }

            // Check if user has admin role using the has_role function
            const { data, error } = await supabase.rpc('has_role', {
                _user_id: currentUser.id,
                _role: 'admin'
            });

            if (error) {
                console.error('Error checking admin role:', error);
                setIsAdminLoggedIn(false);
            } else {
                setIsAdminLoggedIn(data === true);
            }
            setUser(currentUser);
            setLoading(false);
        };

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                checkAdminStatus(session?.user ?? null);
            }
        );

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            checkAdminStatus(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setLoading(false);
            return { success: false, error: error.message };
        }

        // Check if the user has admin role
        const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
            _user_id: data.user.id,
            _role: 'admin'
        });

        if (roleError || !isAdmin) {
            await supabase.auth.signOut();
            setLoading(false);
            return { success: false, error: 'شما دسترسی ادمین ندارید' };
        }

        setIsAdminLoggedIn(true);
        setUser(data.user);
        setLoading(false);
        return { success: true, error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setIsAdminLoggedIn(false);
        setUser(null);
    };

    return { isAdminLoggedIn, loading, user, login, logout };
};
