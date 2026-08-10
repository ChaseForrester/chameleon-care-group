"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import { getServices, saveService, deleteService } from "@/lib/cms";

const empty = {
    title: "",
    short: "",
    description: "",
    image: "/images/service-1.jpg",
    features: "",
    order: 1,
    published: true,
};

export default function AdminServicesPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () =>
        setItems((await getServices({ publishedOnly: false })) || []);
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

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await saveService(editId, {
                title: form.title,
                short: form.short,
                description: form.description,
                image: form.image,
                features: form.features
                    ? form.features.split("\n").map((f) => f.trim()).filter(Boolean)
                    : [],
                order: Number(form.order) || 0,
                published: !!form.published,
            });
            setMessage(editId ? "Service updated." : "Service created.");
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
            title="Services"
            subtitle="Update service information as the business grows."
        >
            <div className={styles.panel} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.panelHeader}>
                    <h2>{editId ? "Edit service" : "New service"}</h2>
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
                            <label>Display order</label>
                            <input
                                type="number"
                                name="order"
                                value={form.order}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-field full">
                            <label>Short summary</label>
                            <input name="short" value={form.short} onChange={onChange} />
                        </div>
                        <div className="form-field full">
                            <label>Full description</label>
                            <textarea
                                name="description"
                                required
                                value={form.description}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-field">
                            <label>Image path / URL</label>
                            <input name="image" value={form.image} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Features (one per line)</label>
                            <textarea
                                name="features"
                                value={form.features}
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
                        Visible on website
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? "Saving…" : "Save service"}
                    </button>
                </form>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>All services</h2>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.order ?? "—"}</td>
                                    <td>
                                        <strong>{item.title}</strong>
                                    </td>
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
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditId(item.id);
                                                    setForm({
                                                        title: item.title || "",
                                                        short: item.short || "",
                                                        description: item.description || "",
                                                        image: item.image || "",
                                                        features: Array.isArray(item.features)
                                                            ? item.features.join("\n")
                                                            : "",
                                                        order: item.order ?? 1,
                                                        published: item.published !== false,
                                                    });
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.danger}
                                                onClick={async () => {
                                                    if (confirm("Delete service?")) {
                                                        await deleteService(item.id);
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
