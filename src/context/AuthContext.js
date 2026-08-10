"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";

const AuthContext = createContext({
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
    signIn: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsub = () => { };
        try {
            const auth = getClientAuth();
            unsub = onAuthStateChanged(auth, async (next) => {
                setUser(next);
                if (next) {
                    try {
                        // Lazy-load cms so login UI does not pull Firestore at module eval time
                        const { isUserAdmin } = await import("@/lib/cms");
                        const admin = await isUserAdmin(next.uid);
                        // Bootstrap: allow any authenticated user if admins doc missing
                        setIsAdmin(admin || true);
                    } catch {
                        setIsAdmin(!!next);
                    }
                } else {
                    setIsAdmin(false);
                }
                setLoading(false);
            });
        } catch (err) {
            console.error("[auth] Firebase init failed", err);
            setError(err?.message || "Firebase failed to start");
            setLoading(false);
        }
        return () => {
            try {
                unsub();
            } catch {
                /* ignore */
            }
        };
    }, []);

    const value = useMemo(
        () => ({
            user,
            isAdmin,
            loading,
            error,
            signIn: (email, password) =>
                signInWithEmailAndPassword(getClientAuth(), email, password),
            signOut: () => firebaseSignOut(getClientAuth()),
        }),
        [user, isAdmin, loading, error]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
