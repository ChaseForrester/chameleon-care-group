"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import {
    getStories,
    saveStory,
    deleteStory,
    importDefaultStories,
    repairStoriesFormatting,
    normalizeStoryFields,
} from "@/lib/cms";

const empty = {
    name: "",
    location: "",
    quote: "",
    published: true,
    consent: true,
};

function storyToForm(item) {
    const n = normalizeStoryFields(item || {});
    return {
        name: n.name || "",
        location: n.location || "",
        quote: n.quote || "",
        published: n.published !== false,
        consent: n.consent !== false,
    };
}

export default function AdminStoriesPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const data = await getStories({ publishedOnly: false });
            setItems((data || []).map((s) => normalizeStoryFields(s)));
        } catch (err) {
            setError(err?.message || "Could not load stories.");
            setItems([]);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Auto-repair fancy dashes once when admin opens this page
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const fixed = await repairStoriesFormatting();
                if (!cancelled && fixed > 0) {
                    setMessage(
                        `Auto-fixed ${fixed} stor${fixed === 1 ? "y" : "ies"} (removed odd dash characters).`
                    );
                    await load();
                }
            } catch {
                /* non-blocking */
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const cleaned = normalizeStoryFields(form);
        if (!cleaned.name.trim()) {
            setError("Name is required.");
            return;
        }
        if (!cleaned.quote.trim()) {
            setError("Quote / story is required.");
            return;
        }
        if (!cleaned.consent) {
            setError("Consent is required before publishing a success story.");
            return;
        }
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await saveStory(editId, cleaned);
            setMessage(
                editId
                    ? "Story updated."
                    : cleaned.published
                        ? "Story added and published."
                        : "Story saved as draft."
            );
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
                `Re-imported ${count} stories. Ryan's location is now "Gosford" (no dash). Published on /success-stories.`
            );
            setForm(empty);
            setEditId(null);
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

    const onEdit = (item) => {
        setError("");
        setMessage("");
        const cleaned = normalizeStoryFields(item);
        setEditId(item.id);
        setForm(storyToForm(cleaned));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <AdminShell
            title="Success stories"
            subtitle="Name and location are separate fields — no dash between them."
            action={
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={onImportWebflow}
                >
                    Re-import &amp; fix stories
                </button>
            }
        >
            <div className={styles.panel} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.panelHeader}>
                    <h2>{editId ? `Edit story: ${form.name || ""}` : "New success story"}</h2>
                </div>
                {message && (
                    <div className={`${styles.alert} ${styles.alertOk}`}>{message}</div>
                )}
                {error && (
                    <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
                )}
                <p
                    style={{
                        marginBottom: "1rem",
                        fontSize: "0.9rem",
                        color: "var(--color-text-muted)",
                    }}
                >
                    Example: <strong>Name</strong> = Ryan, <strong>Location</strong> = Gosford
                    (not &quot;Central Coast – Gosford&quot;). Click{" "}
                    <strong>Re-import &amp; fix stories</strong> if a weird dash still appears.
                </p>
                <form key={editId || "new"} onSubmit={onSubmit}>
                    <div className={styles.formGrid}>
                        <div className="form-field">
                            <label htmlFor="story-name">Name / alias</label>
                            <input
                                id="story-name"
                                name="name"
                                required
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. Ryan"
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="story-location">Location</label>
                            <input
                                id="story-location"
                                name="location"
                                value={form.location}
                                onChange={onChange}
                                placeholder="e.g. Gosford"
                                autoComplete="off"
                            />
                            <span className="hint" style={{ display: "block", marginTop: 4 }}>
                                Suburb or area only — avoid special dashes
                            </span>
                        </div>
                        <div className="form-field full">
                            <label htmlFor="story-quote">Quote / story</label>
                            <textarea
                                id="story-quote"
                                name="quote"
                                required
                                value={form.quote}
                                onChange={onChange}
                                style={{ minHeight: 120 }}
                                placeholder="Their words..."
                            />
                        </div>
                    </div>
                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="consent"
                            checked={!!form.consent}
                            onChange={onChange}
                        />
                        Participant / family consent obtained
                    </label>
                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="published"
                            checked={!!form.published}
                            onChange={onChange}
                        />
                        Published on website
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                        <button type="submit" className="btn btn-primary" disabled={busy}>
                            {busy ? "Saving..." : editId ? "Update story" : "Save story"}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={busy}
                                onClick={() => {
                                    setEditId(null);
                                    setForm(empty);
                                    setError("");
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
                            Click <strong>Re-import &amp; fix stories</strong> to add Erica, Kim,
                            Kelly and Ryan.
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
                                                Consent yes
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
                                                    ? `${item.quote.slice(0, 140)}...`
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
                                            <button type="button" onClick={() => onEdit(item)}>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.danger}
                                                onClick={async () => {
                                                    if (confirm("Delete story?")) {
                                                        await deleteStory(item.id);
                                                        if (editId === item.id) {
                                                            setEditId(null);
                                                            setForm(empty);
                                                        }
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
