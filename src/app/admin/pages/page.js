"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import { getPageContent, savePage } from "@/lib/cms";

const PAGE_KEYS = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" },
];

export default function AdminPagesPage() {
    const [pageId, setPageId] = useState("home");
    const [form, setForm] = useState({
        heroTitle: "",
        heroSubtitle: "",
        bodyHtml: "",
        ctaLabel: "",
        ctaHref: "",
    });
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            const data = await getPageContent(pageId);
            setForm({
                heroTitle: data?.heroTitle || "",
                heroSubtitle: data?.heroSubtitle || "",
                bodyHtml: data?.bodyHtml || "",
                ctaLabel: data?.ctaLabel || "",
                ctaHref: data?.ctaHref || "",
            });
            setMessage("");
            setError("");
        })();
    }, [pageId]);

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await savePage(pageId, form);
            setMessage(`Saved content for “${pageId}”.`);
        } catch (err) {
            setError(err.message || "Save failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminShell
            title="Page content"
            subtitle="Make general page changes without engaging a developer."
        >
            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>Edit page copy</h2>
                    <select
                        value={pageId}
                        onChange={(e) => setPageId(e.target.value)}
                        style={{
                            padding: "0.55rem 0.85rem",
                            borderRadius: "999px",
                            border: "1px solid rgba(13,92,84,0.2)",
                        }}
                    >
                        {PAGE_KEYS.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>
                {message && (
                    <div className={`${styles.alert} ${styles.alertOk}`}>{message}</div>
                )}
                {error && (
                    <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
                )}
                <form onSubmit={onSubmit}>
                    <div className={styles.formGrid}>
                        <div className="form-field full">
                            <label>Hero title</label>
                            <input
                                name="heroTitle"
                                value={form.heroTitle}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-field full">
                            <label>Hero subtitle</label>
                            <textarea
                                name="heroSubtitle"
                                value={form.heroSubtitle}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-field full">
                            <label>Body content</label>
                            <textarea
                                name="bodyHtml"
                                value={form.bodyHtml}
                                onChange={onChange}
                                style={{ minHeight: 180 }}
                            />
                        </div>
                        <div className="form-field">
                            <label>CTA label</label>
                            <input
                                name="ctaLabel"
                                value={form.ctaLabel}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-field">
                            <label>CTA link</label>
                            <input name="ctaHref" value={form.ctaHref} onChange={onChange} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? "Saving…" : "Save page content"}
                    </button>
                </form>
                <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
                    Tip: Default marketing copy is already built into the site. Use this
                    panel for live overrides stored in Firestore.
                </p>
            </div>
        </AdminShell>
    );
}
