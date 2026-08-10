"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import { getOffers, saveOffer, deleteOffer } from "@/lib/cms";

const empty = {
    title: "",
    description: "",
    badge: "",
    ctaLabel: "Get started",
    ctaHref: "/book",
    published: true,
    startsAt: "",
    endsAt: "",
};

export default function AdminOffersPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () => setItems((await getOffers({ publishedOnly: false })) || []);
    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await saveOffer(editId, { ...form, published: !!form.published });
            setMessage(editId ? "Offer updated." : "Offer created.");
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
            title="Offers & campaigns"
            subtitle="Create and manage promotional offers shown on the website."
        >
            <div className={styles.panel} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.panelHeader}>
                    <h2>{editId ? "Edit offer" : "New offer / campaign"}</h2>
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
                            <input name="title" required value={form.title} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Badge</label>
                            <input
                                name="badge"
                                value={form.badge}
                                onChange={onChange}
                                placeholder="e.g. Free consultation"
                            />
                        </div>
                        <div className="form-field full">
                            <label>Description</label>
                            <textarea
                                name="description"
                                required
                                value={form.description}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-field">
                            <label>Button label</label>
                            <input name="ctaLabel" value={form.ctaLabel} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Button link</label>
                            <input name="ctaHref" value={form.ctaHref} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Starts</label>
                            <input
                                type="date"
                                name="startsAt"
                                value={form.startsAt}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-field">
                            <label>Ends</label>
                            <input
                                type="date"
                                name="endsAt"
                                value={form.endsAt}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="published"
                            checked={form.published}
                            onChange={onChange}
                        />
                        Active / published
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? "Saving…" : "Save offer"}
                    </button>
                </form>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>All offers</h2>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>CTA</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.title}</strong>
                                        <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                                            {item.badge}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.statusDot} ${item.published ? styles.live : styles.draft
                                                }`}
                                        >
                                            {item.published ? "Live" : "Off"}
                                        </span>
                                    </td>
                                    <td>{item.ctaLabel}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditId(item.id);
                                                    setForm({
                                                        title: item.title || "",
                                                        description: item.description || "",
                                                        badge: item.badge || "",
                                                        ctaLabel: item.ctaLabel || "Get started",
                                                        ctaHref: item.ctaHref || "/book",
                                                        published: !!item.published,
                                                        startsAt: item.startsAt || "",
                                                        endsAt: item.endsAt || "",
                                                    });
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.danger}
                                                onClick={async () => {
                                                    if (confirm("Delete offer?")) {
                                                        await deleteOffer(item.id);
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
