"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import { getStories, saveStory, deleteStory } from "@/lib/cms";

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

    return (
        <AdminShell
            title="Success stories"
            subtitle="Add participant stories and case studies — only with consent."
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
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? "Saving…" : "Save story"}
                    </button>
                </form>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>All stories</h2>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Consent</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.name}</strong>
                                    </td>
                                    <td>{item.location}</td>
                                    <td>{item.consent ? "Yes" : "No"}</td>
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
