"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import {
    getStories,
    saveStory,
    deleteStory,
    importDefaultStories,
    repairStoriesFormatting,
    normalizeStoryFields,
    dedupeStoriesList,
} from "@/lib/cms";
import { useAuth } from "@/context/AuthContext";

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

function formatWhen(item) {
    const raw =
        item.createdAtIso ||
        item.createdAt ||
        item.updatedAtIso ||
        item.updatedAt ||
        null;
    if (!raw) return "—";
    try {
        return new Date(raw).toLocaleString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

export default function AdminStoriesPage() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const actor = useMemo(
        () => ({
            email: user?.email || "",
            uid: user?.uid || "",
        }),
        [user]
    );

    const load = async () => {
        try {
            const data = await getStories({ publishedOnly: false });
            const normalized = (data || []).map((s) => normalizeStoryFields(s));
            setItems(dedupeStoriesList(normalized));
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
            await saveStory(editId, cleaned, actor);
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
            const count = await importDefaultStories(actor);
            setMessage(
                `Re-imported ${count} stories (no doubles). Attribution: ${actor.email || "system"}.`
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

    const removeDuplicates = async () => {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const data = await getStories({ publishedOnly: false });
            const normalized = (data || []).map((s) => normalizeStoryFields(s));
            const unique = dedupeStoriesList(normalized);
            const keepIds = new Set(unique.map((s) => s.id));
            const extras = normalized.filter((s) => s.id && !keepIds.has(s.id));
            for (const extra of extras) {
                await deleteStory(extra.id);
            }
            setMessage(
                extras.length
                    ? `Removed ${extras.length} duplicate stor${extras.length === 1 ? "y" : "ies"}.`
                    : "No duplicates found."
            );
            await load();
        } catch (err) {
            setError(err.message || "Could not remove duplicates.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminShell
            title="Success stories"
            subtitle="Tracks who added each story and when. Duplicates are blocked."
            action={
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={busy}
                        onClick={removeDuplicates}
                    >
                        Remove doubles
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={busy}
                        onClick={onImportWebflow}
                    >
                        Re-import &amp; fix stories
                    </button>
                </div>
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
                    Signed in as <strong>{user?.email || "…"}</strong> — your email is stored
                    with each story you add. Same name + quote cannot be saved twice.
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
                                <th>Added by</th>
                                <th>When</th>
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
                                    <td style={{ maxWidth: 280 }}>
                                        <span style={{ fontSize: "0.88rem", lineHeight: 1.45 }}>
                                            {item.quote
                                                ? item.quote.length > 100
                                                    ? `${item.quote.slice(0, 100)}...`
                                                    : item.quote
                                                : "—"}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: "0.85rem", wordBreak: "break-word" }}>
                                        {item.createdByEmail || item.updatedByEmail || "—"}
                                        {item.updatedByEmail &&
                                            item.createdByEmail &&
                                            item.updatedByEmail !== item.createdByEmail && (
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "var(--color-text-muted)",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    Last edit: {item.updatedByEmail}
                                                </div>
                                            )}
                                    </td>
                                    <td style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                        {formatWhen(item)}
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
