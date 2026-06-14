import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import i18n from 'i18next';
import { api } from '../api/client';

const AuthContext = createContext(null);

function loadStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('agritech_user') || 'null');
    } catch {
        return null;
    }
}

function persistAuth(token, user) {
    localStorage.setItem('agritech_token', token);
    localStorage.setItem('agritech_user', JSON.stringify(user));
    if (user?.preferred_lang) {
        localStorage.setItem('agritech_lang', user.preferred_lang);
        i18n.changeLanguage(user.preferred_lang);
        document.documentElement.lang = user.preferred_lang;
    }
    window.dispatchEvent(new Event('agritech-auth-change'));
}

function clearStoredAuth() {
    localStorage.removeItem('agritech_token');
    localStorage.removeItem('agritech_user');
    window.dispatchEvent(new Event('agritech-auth-change'));
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => loadStoredUser());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.login({ email, password });
            persistAuth(res.data.token, res.data.user);
            setUser(res.data.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (email, password, preferred_lang) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.register({ email, password, preferred_lang });
            persistAuth(res.data.token, res.data.user);
            setUser(res.data.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearStoredAuth();
        setUser(null);
        setError(null);
    }, []);

    const updateProfile = useCallback(async (fields) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.updateProfile(fields);
            persistAuth(localStorage.getItem('agritech_token'), res.data.user);
            setUser(res.data.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            error,
            login,
            register,
            logout,
            updateProfile,
            isLoggedIn: !!user,
        }),
        [user, loading, error, login, register, logout, updateProfile]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
