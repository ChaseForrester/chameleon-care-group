"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import { seedDefaultsIfEmpty, saveSettings } from "@/lib/cms";
import { SITE } from "@/lib/seedData";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
        phone: SITE.phone,
        email: SITE.email,
        locations: SITE.locations,
    });

    const seed = async () => {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const result = await seedDefaultsIfEmpty();
            setMessage(
                `Seed complete — blogs: ${result.blogs}, stories: ${result.stories}, services: ${result.services}, offers: ${result.offers}. (Zero means collection already had data.)`
            );
        } catch (err) {
            setError(
                err.message ||
                "Seed failed. Create Firestore database and relax rules temporarily if needed."
            );
        } finally {
            setBusy(false);
        }
    };

    const grantAdmin = async () => {
        if (!user) return;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await setDoc(doc(db, "admins", user.uid), {
                email: user.email,
                role: "superadmin",
                createdAt: new Date().toISOString(),
            });
            setMessage(
                `Admin role written for ${user.email} (${user.uid}). Deploy firestore.rules after this.`
            );
        } catch (err) {
            setError(
                err.message ||
                "Could not write admins/{uid}. Temporarily set allow write on admins or use Console."
            );
        } finally {
            setBusy(false);
        }
    };

    const saveSite = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await saveSettings(form);
            setMessage("Site settings saved.");
        } catch (err) {
            setError(err.message || "Save failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminShell
            title="Settings & seed"
            subtitle="Bootstrap Firebase content and register your super admin account."
        >
            {message && (
                <div className={`${styles.alert} ${styles.alertOk}`}>{message}</div>
            )}
            {error && (
                <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
            )}

            <div className={styles.panel} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.panelHeader}>
                    <h2>Firebase bootstrap</h2>
                </div>
                <p style={{ marginBottom: "1rem" }}>
                    Project: <strong>chameleon-care-group-au</strong>
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busy}
                        onClick={seed}
                    >
                        Seed default content
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        disabled={busy || !user}
                        onClick={grantAdmin}
                    >
                        Register me as super admin
                    </button>
                </div>
                <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
                    1) Create Auth user in Firebase Console (Email/Password).<br />
                    2) Sign in at /admin/login.<br />
                    3) Click &quot;Register me as super admin&quot;.<br />
                    4) Deploy rules:{" "}
                    <code>firebase deploy --only firestore:rules,storage</code>
                </p>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>Site contact settings</h2>
                </div>
                <form onSubmit={saveSite}>
                    <div className={styles.formGrid}>
                        <div className="form-field">
                            <label>Phone</label>
                            <input
                                value={form.phone}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, phone: e.target.value }))
                                }
                            />
                        </div>
                        <div className="form-field">
                            <label>Email</label>
                            <input
                                value={form.email}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, email: e.target.value }))
                                }
                            />
                        </div>
                        <div className="form-field full">
                            <label>Locations line</label>
                            <input
                                value={form.locations}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, locations: e.target.value }))
                                }
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={busy}>
                        Save settings
                    </button>
                </form>
            </div>
        </AdminShell>
    );
}
