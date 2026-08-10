"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import {
    getStories,
    saveStory,
    deleteStory,
    importDefaultStories,
} from "@/lib/cms";

const empty = {
    name: "",
    location: "",
    quote: "",
    published: true,
    consent: true,
};

export default function AdminStoriesPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () =>
        setItems((await getStories({ publishedOnly: false })) || []);
    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.consent) {
            setError("Consent is required before publishing a success story.");
            return;
        }
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await saveStory(editId, {
                ...form,
                published: !!form.published,
                consent: !!form.consent,
            });
            setMessage(editId ? "Story updated." : "Story added.");
            setForm(empty);
            setEditId(null);
            await load();
        } catch (err) {
            setError(err.message || "Save failed");
        } finally {
            setBusy(false);
        }
    };

    const onImportWebflow = async () => {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const count = await importDefaultStories();
            setMessage(
                `Imported ${count} success stories from the original website (Erica, Kim, Kelly, Ryan). They are published and live on /success-stories.`
            );
            await load();
        } catch (err) {
            setError(
                err.message ||
                "Import failed. Sign in as super admin and ensure Firestore is enabled."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminShell
            title="Success stories"
            subtitle="Participant and family stories from the website — only publish with consent."
            action={
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={onImportWebflow}
                >
                    Import original site stories
                </button>
            }
        >
            <div className={styles.panel} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.panelHeader}>
                    <h2>{editId ? "Edit story" : "New success story"}</h2>
                </div>
                {message && (
                    <div className={`${styles.alert} ${styles.alertOk}`}>{message}</div>
                )}
                {error && (
                    <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
                )}
                <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                    The original Webflow site featured four stories (Erica, Kim, Kelly and Ryan).
                    Use <strong>Import original site stories</strong> to load them into Firestore
                    and publish them on the live Success Stories page.
                </p>
                <form onSubmit={onSubmit}>
                    <div className={styles.formGrid}>
                        <div className="form-field">
                            <label>Name / alias</label>
                            <input name="name" required value={form.name} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Location</label>
                            <input
                                name="location"
                                value={form.location}
                                onChange={onChange}
                                placeholder="Sutherland Shire"
                            />
                        </div>
                        <div className="form-field full">
                            <label>Quote / story</label>
                            <textarea
                                name="quote"
                                required
                                value={form.quote}
                                onChange={onChange}
                                style={{ minHeight: 120 }}
                            />
                        </div>
                    </div>
                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="consent"
                            checked={form.consent}
                            onChange={onChange}
                        />
                        Participant / family consent obtained
                    </label>
                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="published"
                            checked={form.published}
                            onChange={onChange}
                        />
                        Published on website
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                        <button type="submit" className="btn btn-primary" disabled={busy}>
                            {busy ? "Saving…" : editId ? "Update story" : "Save story"}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={busy}
                                onClick={() => {
                                    setEditId(null);
                                    setForm(empty);
                                }}
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>All stories ({items.length})</h2>
                </div>
                {!items.length && (
                    <div className={styles.inquiryEmpty} style={{ marginBottom: "1rem" }}>
                        <strong>No stories in Firestore yet</strong>
                        <p>
                            Click <strong>Import original site stories</strong> to add Erica, Kim,
                            Kelly and Ryan from chameleoncaregroup.webflow.io.
                        </p>
                    </div>
                )}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Story</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.name}</strong>
                                        {item.consent ? (
                                            <div style={{ fontSize: "0.75rem", color: "#047857" }}>
                                                Consent ✓
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: "0.75rem", color: "#b91c1c" }}>
                                                No consent
                                            </div>
                                        )}
                                    </td>
                                    <td>{item.location || "—"}</td>
                                    <td style={{ maxWidth: 360 }}>
                                        <span style={{ fontSize: "0.88rem", lineHeight: 1.45 }}>
                                            {item.quote
                                                ? item.quote.length > 140
                                                    ? `${item.quote.slice(0, 140)}…`
                                                    : item.quote
                                                : "—"}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.statusDot} ${item.published ? styles.live : styles.draft
                                                }`}
                                        >
                                            {item.published ? "Live" : "Draft"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditId(item.id);
                                                    setForm({
                                                        name: item.name || "",
                                                        location: item.location || "",
                                                        quote: item.quote || "",
                                                        published: !!item.published,
                                                        consent: !!item.consent,
                                                    });
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.danger}
                                                onClick={async () => {
                                                    if (confirm("Delete story?")) {
                                                        await deleteStory(item.id);
                                                        await load();
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminShell>
    );
}
