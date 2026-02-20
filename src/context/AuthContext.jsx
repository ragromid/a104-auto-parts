import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLoginModal from '../components/admin/AdminLoginModal';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const useDb = import.meta.env.VITE_USE_DB === 'true';

    useEffect(() => {
        // ALWAYS STRICT DEFAULT TO FALSE
        // Only grant admin if DB is explicitly turned OFF for local dev
        if (useDb === false && import.meta.env.MODE === 'development') {
            setIsAuthenticated(true);
            setIsAdminMode(true);
            setAuthLoading(false);
            return;
        } else if (!useDb) {
            setIsAuthenticated(false);
            setIsAdminMode(false);
            setAuthLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session?.user);
            setIsAdminMode(!!session?.user);
            setAuthLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session?.user);
            setIsAdminMode(!!session?.user); // Auto-enable admin mode if logged in
        });

        return () => subscription.unsubscribe();
    }, [useDb]);

    const login = async (email, password) => {
        if (!useDb) {
            setIsAuthenticated(true);
            setIsAdminMode(true);
            return { success: true };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        if (useDb) {
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Logout failed:", error.message);
        }
        setIsAuthenticated(false);
        setIsAdminMode(false);
        setUser(null);
    };

    const toggleAdminMode = () => {
        // In this new flow, we simply toggle the visual Admin UI on/off if they are authenticated
        if (isAuthenticated) {
            setIsAdminMode(prev => !prev);
        }
    };

    const showLogin = () => setIsLoginModalOpen(true);
    const hideLogin = () => setIsLoginModalOpen(false);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isAdminMode,
            user,
            authLoading,
            login,
            logout,
            toggleAdminMode,
            showLogin,
            hideLogin
        }}>
            {children}
            <AdminLoginModal isOpen={isLoginModalOpen} onClose={hideLogin} />
        </AuthContext.Provider>
    );
};
