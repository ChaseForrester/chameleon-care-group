"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
    const { user, loading, signIn, error: authError } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!loading && user) router.replace("/admin");
    }, [user, loading, router]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            await signIn(email, password);
            router.replace("/admin");
        } catch (err) {
            setError(err?.message || "Sign-in failed. Check email and password.");
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading…</div>;
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <h1>Super Admin</h1>
                <p>Sign in to manage blogs, offers, stories and site content.</p>
                {(error || authError) && (
                    <div className={`${styles.alert} ${styles.alertError}`}>
                        {error || authError}
                    </div>
                )}
                <form onSubmit={onSubmit}>
                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={busy}
                    >
                        {busy ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
