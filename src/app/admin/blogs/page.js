"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import RichTextEditor from "@/components/RichTextEditor";
import styles from "../admin.module.css";
import {
    getBlogs,
    saveBlog,
    deleteBlog,
    uploadBlogMedia,
    explainCmsError,
} from "@/lib/cms";
import {
    contentIsEmpty,
    legacyContentToHtml,
    looksLikeHtml,
} from "@/lib/htmlContent";

const empty = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "Chameleon Care Group",
    tags: "",
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
    const [aiBusy, setAiBusy] = useState(false);
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
            const url = await uploadBlogMedia(file, "blogs");
            setForm((f) => ({ ...f, coverImage: url }));
        } catch (err) {
            setError(explainCmsError(err) || "Upload failed — enable Storage in Firebase Console.");
        } finally {
            setBusy(false);
        }
    };

    const generateFromTitle = async () => {
        if (!form.title.trim()) {
            setError("Enter a title first, then click Generate with AI.");
            return;
        }
        setAiBusy(true);
        setError("");
        setMessage("");
        try {
            const res = await fetch("/api/generate-blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: form.title.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                throw new Error(data.error || `AI request failed (${res.status})`);
            }
            setForm((f) => ({
                ...f,
                excerpt: data.excerpt || f.excerpt,
                content: data.contentHtml || f.content,
                tags: Array.isArray(data.tags) && data.tags.length
                    ? data.tags.join(", ")
                    : f.tags,
                slug: f.slug || slugify(f.title),
            }));
            setMessage(
                "AI draft ready — review the rich text, edit anything, then publish."
            );
        } catch (err) {
            setError(err.message || "AI generation failed.");
        } finally {
            setAiBusy(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (contentIsEmpty(form.content)) {
            setError(
                "Add article text, images, or a video — or generate a draft from the title with AI."
            );
            return;
        }
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
            setMessage((editId ? "Blog updated." : "Blog created.") + live);
            setForm(empty);
            setEditId(null);
            await load();
        } catch (err) {
            setError(explainCmsError(err));
        } finally {
            setBusy(false);
        }
    };

    const onEdit = (item) => {
        setEditId(item.id);
        const raw = item.content || "";
        setForm({
            title: item.title || "",
            slug: item.slug || "",
            excerpt: item.excerpt || "",
            // Convert legacy plain/markdown bodies into HTML for the editor
            content: looksLikeHtml(raw) ? raw : legacyContentToHtml(raw),
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
            subtitle="Write with images, galleries, videos and links. Publish to the public /blog page."
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

                <div
                    className={styles.alert}
                    style={{
                        background: "#f0fdfa",
                        border: "1px solid rgba(13, 148, 136, 0.25)",
                        color: "var(--color-bg-dark)",
                    }}
                >
                    <strong>Fast path:</strong> type a title →{" "}
                    <em>Generate with AI</em> → add pictures, videos or links in the
                    toolbar → publish. Requires <code>XAI_API_KEY</code> on the server.
                </div>

                <form onSubmit={onSubmit}>
                    <div className={styles.formGrid}>
                        <div className="form-field full">
                            <label>Title</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                                <input
                                    name="title"
                                    required
                                    value={form.title}
                                    onChange={onChange}
                                    placeholder="e.g. How NDIS respite supports families"
                                    style={{ flex: "1 1 240px" }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-accent"
                                    disabled={aiBusy || busy || !form.title.trim()}
                                    onClick={generateFromTitle}
                                >
                                    {aiBusy ? "Writing…" : "Generate with AI"}
                                </button>
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Slug (URL)</label>
                            <input name="slug" required value={form.slug} onChange={onChange} />
                        </div>
                        <div className="form-field">
                            <label>Author</label>
                            <input name="author" value={form.author} onChange={onChange} />
                        </div>
                        <div className="form-field full">
                            <label>Excerpt (social / SEO description)</label>
                            <input
                                name="excerpt"
                                value={form.excerpt}
                                onChange={onChange}
                                placeholder="Short summary for Facebook previews and the blog card"
                            />
                        </div>
                        <div className="form-field full">
                            <label>Article body</label>
                            <RichTextEditor
                                value={form.content}
                                onChange={(html) =>
                                    setForm((f) => ({ ...f, content: html }))
                                }
                                onUploadFile={(file) => uploadBlogMedia(file, "blogs")}
                                onError={(msg) => setError(msg || "")}
                                placeholder="Write here, or generate a draft from the title…"
                                minHeight={320}
                            />
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
                            <label>Or upload cover image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFile}
                                disabled={busy}
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
                        Published (must be ticked to show on /blog)
                    </label>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                            alignItems: "center",
                        }}
                    >
                        <button type="submit" className="btn btn-primary" disabled={busy || aiBusy}>
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
                                        No posts yet. Add a title and generate a draft above.
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
