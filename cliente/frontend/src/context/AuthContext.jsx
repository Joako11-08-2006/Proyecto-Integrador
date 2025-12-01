import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAuthCredentials } from "../api";

const AuthContext = createContext();
const STORAGE_KEY = "cliente-auth";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            setCredentials(parsed.credentials);
            setUser(parsed.user);
            setAuthCredentials(parsed.credentials);
        }
    }, []);

    useEffect(() => {
        if (credentials && user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ credentials, user }));
            setAuthCredentials(credentials);
        } else {
            localStorage.removeItem(STORAGE_KEY);
            setAuthCredentials(null);
        }
    }, [credentials, user]);

    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.login({ username, password });
            setCredentials({ username, password });
            setUser(data.user);
            setAuthCredentials({ username, password });
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const profile = await api.register(payload);
            setCredentials({ username: payload.username, password: payload.password });
            setUser(profile);
            setAuthCredentials({ username: payload.username, password: payload.password });
            return profile;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = () => {
        setUser(null);
        setCredentials(null);
        setNotifications([]);
        setAuthCredentials(null);
    };

    const refreshProfile = useCallback(async () => {
        if (!credentials) return null;
        try {
            const profile = await api.profile();
            setUser(profile);
            return profile;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [credentials]);

    const updateProfile = async (payload) => {
        if (!credentials) throw new Error("No hay credenciales");
        const updated = await api.profileUpdate(payload);
        setUser(updated);
        return updated;
    };

    const changePassword = async (payload) => {
        if (!credentials) throw new Error("No hay credenciales");
        return api.profilePassword(payload);
    };

    const loadNotifications = useCallback(async () => {
        if (!credentials) return [];
        const list = await api.notifications();
        setNotifications(list || []);
        return list;
    }, [credentials]);

    return (
        <AuthContext.Provider
            value={{
                user,
                credentials,
                notifications,
                loading,
                error,
                login,
                register,
                logout,
                refreshProfile,
                updateProfile,
                changePassword,
                loadNotifications,
                setNotifications,
                setError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
