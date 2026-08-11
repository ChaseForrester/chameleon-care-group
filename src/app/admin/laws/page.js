"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import {
    getLegalDocs,
    saveLegalDoc,
    upsertLegalDocById,
    deleteLegalDoc,
    uploadFile,
} from "@/lib/cms";

const CATEGORIES = [
    "Forms",
    "Pricing",
    "NDIS Quality & Safeguards",
    "Participants",
    "Safety",
    "Privacy",
    "Documents",
];

const empty = {
    title: "",
    description: "",
    category: "Documents",
    file: "",
    storagePath: "",
    externalUrl: "",
    externalLabel: "",
    order: 100,
    published: true,
};

export default function AdminLawsPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const data = await getLegalDocs({ includeUnpublished: true });
            setItems(data || []);
        } catch (err) {
            setError(err?.message || "Could not load documents.");
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({
            ...f,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "order"
                        ? Number(value)
                        : value,
        }));
    };

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError("File too large (max 10MB).");
            return;
        }
        setBusy(true);
        setError("");
        try {
            const meta = await uploadFile(file, "legal");
            setForm((f) => ({
                ...f,
                file: meta.url,
                storagePath: meta.path,
            }));
            setMessage(`Uploaded ${meta.name}`);
        } catch (err) {
            setError(err.message || "Upload failed. Check Storage rules and login.");
        } finally {
            setBusy(false);
            e.target.value = "";
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
            if (editId) {
                // Prefer fixed id upsert so seed docs can be overridden
                await upsertLegalDocById(editId, form);
                setMessage("Document updated. It is live on /laws when published.");
            } else {
                await saveLegalDoc(null, form);
                setMessage("Document added. It is live on /laws when published.");
            }
            setForm(empty);
            setEditId(null);
            await load();
        } catch (err) {
            setError(err.message || "Save failed.");
        } finally {
            setBusy(false);
        }
    };

    const onEdit = (item) => {
        setEditId(item.id);
        setForm({
            title: item.title || "",
            description: item.description || "",
            category: item.category || "Documents",
            file: item.file || "",
            storagePath: item.storagePath || "",
            externalUrl: item.externalUrl || "",
            externalLabel: item.externalLabel || "",
            order: item.order ?? 100,
            published: item.published !== false,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onDelete = async (item) => {
        if (item.source === "seed" && !item.storagePath) {
            // Soft-hide built-in seed by publishing false override
            if (
                !confirm(
                    "This is a built-in document. Hide it from the public /laws page?"
                )
            ) {
                return;
            }
            setBusy(true);
            try {
                await upsertLegalDocById(item.id, {
                    ...item,
                    published: false,
                    source: "cms",
                });
                setMessage("Built-in document hidden from the public site.");
                await load();
            } catch (err) {
                setError(err.message || "Could not hide document.");
            } finally {
                setBusy(false);
            }
            return;
        }

        if (!confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
        setBusy(true);
        try {
            await deleteLegalDoc(item.id, { storagePath: item.storagePath });
            setMessage("Document deleted.");
            if (editId === item.id) {
                setEditId(null);
                setForm(empty);
            }
            await load();
        } catch (err) {
            setError(err.message || "Delete failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminShell
            title="Laws & documents"
            subtitle="Upload, replace or remove PDFs shown on the public Laws page."
            action={
                <a className="btn btn-outline btn-sm" href="/laws" target="_blank" rel="noreferrer">
                    View /laws
                </a>
            }
        >
            <div className={styles.panel} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.panelHeader}>
                    <h2>{editId ? "Edit document" : "Add document"}</h2>
                </div>
                {message && (
                    <div className={`${styles.alert} ${styles.alertOk}`}>{message}</div>
                )}
                {error && (
                    <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
                )}
                <form onSubmit={onSubmit}>
                    <div className={styles.formGrid}>
                        <div className="form-field">
                            <label>Title</label>
                            <input
                                name="title"
                                required
                                value={form.title}
                                onChange={onChange}
                                placeholder="e.g. Referral Form"
                            />
                        </div>
                        <div className="form-field">
                            <label>Category</label>
                            <select name="category" value={form.category} onChange={onChange}>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field full">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={onChange}
                                placeholder="Short plain-language description"
                            />
                        </div>
                        <div className="form-field">
                            <label>Upload PDF</label>
                            <input
                                type="file"
                                accept=".pdf,application/pdf,.doc,.docx,image/*"
                                onChange={onFile}
                                disabled={busy}
                            />
                            <span className="hint" style={{ display: "block", marginTop: 4 }}>
                                PDF preferred · max 10MB
                            </span>
                        </div>
                        <div className="form-field">
                            <label>Or file URL</label>
                            <input
                                name="file"
                                value={form.file}
                                onChange={onChange}
                                placeholder="/pdfs/... or https://..."
                            />
                        </div>
                        <div className="form-field">
                            <label>External link (optional)</label>
                            <input
                                name="externalUrl"
                                value={form.externalUrl}
                                onChange={onChange}
                                placeholder="https://www.ndis.gov.au/..."
                            />
                        </div>
                        <div className="form-field">
                            <label>External link label</label>
                            <input
                                name="externalLabel"
                                value={form.externalLabel}
                                onChange={onChange}
                                placeholder="Official source"
                            />
                        </div>
                        <div className="form-field">
                            <label>Display order</label>
                            <input
                                type="number"
                                name="order"
                                value={form.order}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="published"
                            checked={!!form.published}
                            onChange={onChange}
                        />
                        Published on /laws
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                        <button type="submit" className="btn btn-primary" disabled={busy}>
                            {busy ? "Saving…" : editId ? "Update document" : "Add document"}
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
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>All documents ({items.length})</h2>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Source</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.title}</strong>
                                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                                            {item.description?.slice(0, 80)}
                                            {item.description?.length > 80 ? "…" : ""}
                                        </div>
                                    </td>
                                    <td>{item.category || "—"}</td>
                                    <td>{item.source === "seed" ? "Built-in" : "Uploaded"}</td>
                                    <td>
                                        <span
                                            className={`${styles.statusDot} ${item.published !== false ? styles.live : styles.draft
                                                }`}
                                        >
                                            {item.published !== false ? "Live" : "Hidden"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            {item.file && (
                                                <a
                                                    href={item.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Open
                                                </a>
                                            )}
                                            <button type="button" onClick={() => onEdit(item)}>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.danger}
                                                onClick={() => onDelete(item)}
                                            >
                                                {item.source === "seed" ? "Hide" : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!items.length && (
                                <tr>
                                    <td colSpan={5}>No documents yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminShell>
    );
}
