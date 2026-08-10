"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import {
    getBlogs,
    saveBlog,
    deleteBlog,
    uploadImage,
} from "@/lib/cms";

const empty = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "Chameleon Care Group",
    tags: "",
    /** Default on so new posts appear on /blog immediately */
    published: true,
};

function slugify(s) {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function AdminBlogsPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        const data = await getBlogs({ publishedOnly: false });
        setItems(data || []);
    };

    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => {
            const next = { ...f, [name]: type === "checkbox" ? checked : value };
            if (name === "title" && !editId) next.slug = slugify(value);
            return next;
        });
    };

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBusy(true);
        try {
            const url = await uploadImage(file, "blogs");
            setForm((f) => ({ ...f, coverImage: url }));
        } catch (err) {
            setError(err.message || "Upload failed — enable Storage in Firebase Console.");
        } finally {
            setBusy(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const payload = {
                title: form.title,
                slug: form.slug || slugify(form.title),
                excerpt: form.excerpt,
                content: form.content,
                coverImage: form.coverImage,
                author: form.author,
                tags: form.tags
                    ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
                    : [],
                published: !!form.published,
            };
            await saveBlog(editId, payload);
            const live = payload.published
                ? ` Live on /blog/${payload.slug}`
                : " Saved as draft (not on public site until Published is ticked).";
            setMessage(
                (editId ? "Blog updated." : "Blog created.") + live
            );
            setForm(empty);
            setEditId(null);
            await load();
        } catch (err) {
            setError(err.message || "Save failed. Ensure Firestore is set up and you are an admin.");
        } finally {
            setBusy(false);
        }
    };

    const onEdit = (item) => {
        setEditId(item.id);
        setForm({
            title: item.title || "",
            slug: item.slug || "",
            excerpt: item.excerpt || "",
            content: item.content || "",
            coverImage: item.coverImage || "",
            author: item.author || "Chameleon Care Group",
            tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
            published: !!item.published,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onDelete = async (id) => {
        if (!confirm("Delete this blog post?")) return;
        try {
            await deleteBlog(id);
            await load();
        } catch (err) {
            setError(err.message || "Delete failed");
        }
    };

    return (
        <AdminShell
            title="Blogs"
            subtitle="Upload, edit and publish blog posts."
            action={
                editId ? (
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            setEditId(null);
                            setForm(empty);
                        }}
                    >
                        Cancel edit
                    </button>
                ) : null
            }
        >
            <div className={styles.panel} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.panelHeader}>
                    <h2>{editId ? "Edit post" : "New blog post"}</h2>
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
                            <label>Slug (URL)</label>
                            <input name="slug" required value={form.slug} onChange={onChange} />
                        </div>
                        <div className="form-field full">
                            <label>Excerpt</label>
                            <input name="excerpt" value={form.excerpt} onChange={onChange} />
                        </div>
                        <div className="form-field full">
                            <label>Content (Markdown-style paragraphs)</label>
                            <textarea
                                name="content"
                                required
                                value={form.content}
                                onChange={onChange}
                                style={{ minHeight: 200 }}
                            />
                        </div>
                        <div className="form-field">
                            <label>Author</label>
                            <input name="author" value={form.author} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Tags (comma separated)</label>
                            <input name="tags" value={form.tags} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Cover image URL</label>
                            <input
                                name="coverImage"
                                value={form.coverImage}
                                onChange={onChange}
                                placeholder="/images/... or https://..."
                            />
                            {form.coverImage ? (
                                <div className={styles.coverPreview}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={form.coverImage} alt="Cover preview" />
                                </div>
                            ) : null}
                        </div>
                        <div className="form-field">
                            <label>Or upload image</label>
                            <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
                            <span className="hint" style={{ display: "block", marginTop: "0.35rem" }}>
                                JPG, PNG or WebP · max 10MB · stored in Firebase Storage
                            </span>
                        </div>
                    </div>
                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="published"
                            checked={form.published}
                            onChange={onChange}
                        />
                        Published (must be ticked to show on /blog)
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                        <button type="submit" className="btn btn-primary" disabled={busy}>
                            {busy ? "Saving…" : editId ? "Update post" : "Publish / save post"}
                        </button>
                        {form.slug && form.published && (
                            <a
                                className="btn btn-outline"
                                href={`/blog/${form.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Preview on website
                            </a>
                        )}
                    </div>
                </form>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>All posts ({items.length})</h2>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Slug</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.title}</strong>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.statusDot} ${item.published ? styles.live : styles.draft
                                                }`}
                                        >
                                            {item.published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td>{item.slug}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            {item.published && (item.slug || item.id) && (
                                                <a
                                                    href={`/blog/${item.slug || item.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View
                                                </a>
                                            )}
                                            <button type="button" onClick={() => onEdit(item)}>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.danger}
                                                onClick={() => onDelete(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!items.length && (
                                <tr>
                                    <td colSpan={4}>
                                        No posts in Firestore yet. Create one above or seed defaults
                                        in Settings.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminShell>
    );
}
