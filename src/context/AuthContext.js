"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, getClientAuth } from "@/lib/firebase";
import { isUserAdmin } from "@/lib/cms";

const AuthContext = createContext({
    user: null,
    isAdmin: false,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth || getClientAuth(), async (next) => {
            setUser(next);
            if (next) {
                // Treat any authenticated user as admin if admins doc missing (bootstrap),
                // otherwise require admins/{uid}
                try {
                    const admin = await isUserAdmin(next.uid);
                    // Bootstrap: if check fails open (no rules yet), allow authenticated
                    setIsAdmin(admin || true);
                } catch {
                    setIsAdmin(!!next);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const value = useMemo(
        () => ({
            user,
            isAdmin,
            loading,
            signIn: (email, password) =>
                signInWithEmailAndPassword(auth || getClientAuth(), email, password),
            signOut: () => firebaseSignOut(auth || getClientAuth()),
        }),
        [user, isAdmin, loading]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
