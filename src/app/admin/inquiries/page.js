"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import {
    deleteInquiry,
    getInquiries,
    updateInquiry,
} from "@/lib/cms";
import {
    formatFileSize,
    formatInquiryDate,
    getInquiryDocuments,
    getInquirySections,
    inquiryDisplayName,
    inquirySourceBadge,
    statusMeta,
} from "@/lib/inquiryDisplay";

const FILTERS = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "read", label: "Reviewed" },
    { id: "archived", label: "Archived" },
    { id: "book-wizard", label: "Applications" },
    { id: "contact", label: "Contact" },
    { id: "referral", label: "Referrals" },
];

function matchesFilter(item, filter) {
    if (filter === "all") return true;
    if (filter === "new") return (item.status || "new") === "new";
    if (filter === "read") return item.status === "read" || item.status === "reviewed";
    if (filter === "archived") return item.status === "archived";
    if (filter === "book-wizard") return item.source === "book-wizard";
    if (filter === "contact") {
        return item.source === "contact" || item.source === "contact-us";
    }
    if (filter === "referral") return item.source === "referral";
    return true;
}

function previewText(item) {
    if (item.message && item.source !== "book-wizard") {
        const t = String(item.message).replace(/\s+/g, " ").trim();
        return t.length > 100 ? `${t.slice(0, 100)}…` : t;
    }
    if (item.source === "book-wizard") {
        const services = (item.preferredServices || "")
            .split("|")
            .filter(Boolean)
            .join(", ");
        return services || item.fundingType || "Book with us application";
    }
    return item.subject || "Enquiry";
}

export default function AdminInquiriesPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedId, setSelectedId] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getInquiries();
            setItems(data || []);
        } catch (err) {
            setError(err?.message || "Could not load inquiries.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(
        () => items.filter((item) => matchesFilter(item, filter)),
        [items, filter]
    );

    const selected = useMemo(
        () => items.find((i) => i.id === selectedId) || null,
        [items, selectedId]
    );

    // Keep selection valid when list changes
    useEffect(() => {
        if (selectedId && !items.some((i) => i.id === selectedId)) {
            setSelectedId(null);
        }
    }, [items, selectedId]);

    const counts = useMemo(() => {
        const c = { all: items.length, new: 0, read: 0, archived: 0 };
        items.forEach((item) => {
            const s = item.status || "new";
            if (s === "new") c.new += 1;
            else if (s === "archived") c.archived += 1;
            else c.read += 1;
        });
        return c;
    }, [items]);

    const setStatus = async (item, status) => {
        if (!item?.id) return;
        setBusy(true);
        setError("");
        try {
            await updateInquiry(item.id, { status });
            setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, status } : i))
            );
        } catch (err) {
            setError(err?.message || "Could not update status.");
        } finally {
            setBusy(false);
        }
    };

    const onSelect = async (item) => {
        setSelectedId(item.id);
        if ((item.status || "new") === "new") {
            // Mark as reviewed when opened
            try {
                await updateInquiry(item.id, { status: "read" });
                setItems((prev) =>
                    prev.map((i) =>
                        i.id === item.id ? { ...i, status: "read" } : i
                    )
                );
            } catch {
                /* non-blocking */
            }
        }
    };

    const onDelete = async (item) => {
        if (!item?.id) return;
        if (!confirm("Delete this inquiry permanently?")) return;
        setBusy(true);
        setError("");
        try {
            await deleteInquiry(item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
            if (selectedId === item.id) setSelectedId(null);
        } catch (err) {
            setError(err?.message || "Could not delete inquiry.");
        } finally {
            setBusy(false);
        }
    };

    const sections = selected ? getInquirySections(selected) : [];
    const documents = selected ? getInquiryDocuments(selected) : [];
    const meta = selected ? statusMeta(selected.status) : null;

    return (
        <AdminShell
            title="Inquiries"
            subtitle="Contact forms, referrals and Book With Us applications — with documents."
            action={
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={load}
                    disabled={loading}
                >
                    {loading ? "Refreshing…" : "Refresh"}
                </button>
            }
        >
            {error && (
                <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
            )}

            <div className={styles.inquiryToolbar}>
                <div className={styles.inquiryFilters}>
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            className={`${styles.filterChip} ${filter === f.id ? styles.filterChipActive : ""
                                }`}
                            onClick={() => setFilter(f.id)}
                        >
                            {f.label}
                            {f.id === "all" && (
                                <span className={styles.filterCount}>{counts.all}</span>
                            )}
                            {f.id === "new" && (
                                <span className={styles.filterCount}>{counts.new}</span>
                            )}
                        </button>
                    ))}
                </div>
                <p className={styles.inquiryHint}>
                    {filtered.length} shown
                    {counts.new > 0 ? ` · ${counts.new} new` : ""}
                </p>
            </div>

            <div className={styles.inquiryLayout}>
                {/* List */}
                <div className={styles.inquiryList}>
                    {loading && (
                        <div className={styles.inquiryEmpty}>Loading inquiries…</div>
                    )}
                    {!loading && !filtered.length && (
                        <div className={styles.inquiryEmpty}>
                            <strong>No inquiries here</strong>
                            <p>
                                When someone submits Contact, Referral or Book With Us, it will
                                appear in this list.
                            </p>
                        </div>
                    )}
                    {!loading &&
                        filtered.map((item) => {
                            const st = statusMeta(item.status);
                            const docs = getInquiryDocuments(item);
                            const active = item.id === selectedId;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`${styles.inquiryCard} ${active ? styles.inquiryCardActive : ""
                                        } ${(item.status || "new") === "new"
                                            ? styles.inquiryCardNew
                                            : ""
                                        }`}
                                    onClick={() => onSelect(item)}
                                >
                                    <div className={styles.inquiryCardTop}>
                                        <span
                                            className={`${styles.badge} ${styles.badgeSource}`}
                                        >
                                            {inquirySourceBadge(item.source)}
                                        </span>
                                        <span
                                            className={`${styles.badge} ${st.tone === "new"
                                                    ? styles.badgeNew
                                                    : st.tone === "archived"
                                                        ? styles.badgeArchived
                                                        : styles.badgeMuted
                                                }`}
                                        >
                                            {st.label}
                                        </span>
                                    </div>
                                    <strong className={styles.inquiryName}>
                                        {inquiryDisplayName(item)}
                                    </strong>
                                    <span className={styles.inquiryPreview}>
                                        {previewText(item)}
                                    </span>
                                    <div className={styles.inquiryCardMeta}>
                                        <span>{formatInquiryDate(item.createdAt)}</span>
                                        {docs.length > 0 && (
                                            <span className={styles.docCount}>
                                                {docs.length} file{docs.length === 1 ? "" : "s"}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                </div>

                {/* Detail */}
                <div className={styles.inquiryDetail}>
                    {!selected && (
                        <div className={styles.inquiryEmptyDetail}>
                            <div className={styles.emptyIcon}>inbox</div>
                            <h2>Select an inquiry</h2>
                            <p>
                                Choose a message from the list to view full details, contact
                                info and downloadable documents.
                            </p>
                        </div>
                    )}

                    {selected && (
                        <>
                            <header className={styles.detailHeader}>
                                <div>
                                    <div className={styles.detailBadges}>
                                        <span
                                            className={`${styles.badge} ${styles.badgeSource}`}
                                        >
                                            {inquirySourceBadge(selected.source)}
                                        </span>
                                        <span
                                            className={`${styles.badge} ${meta.tone === "new"
                                                    ? styles.badgeNew
                                                    : meta.tone === "archived"
                                                        ? styles.badgeArchived
                                                        : styles.badgeMuted
                                                }`}
                                        >
                                            {meta.label}
                                        </span>
                                    </div>
                                    <h2>{inquiryDisplayName(selected)}</h2>
                                    <p className={styles.detailWhen}>
                                        Received {formatInquiryDate(selected.createdAt)}
                                    </p>
                                </div>
                                <div className={styles.detailActions}>
                                    {selected.email && (
                                        <a
                                            className="btn btn-primary btn-sm"
                                            href={`mailto:${selected.email}`}
                                        >
                                            Email
                                        </a>
                                    )}
                                    {selected.phone && (
                                        <a
                                            className="btn btn-outline btn-sm"
                                            href={`tel:${String(selected.phone).replace(/\s/g, "")}`}
                                        >
                                            Call
                                        </a>
                                    )}
                                    {(selected.status || "new") !== "archived" ? (
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            disabled={busy}
                                            onClick={() => setStatus(selected, "archived")}
                                        >
                                            Archive
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            disabled={busy}
                                            onClick={() => setStatus(selected, "read")}
                                        >
                                            Unarchive
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={`btn btn-outline btn-sm ${styles.btnDanger}`}
                                        disabled={busy}
                                        onClick={() => onDelete(selected)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </header>

                            {/* Quick contact strip */}
                            <div className={styles.contactStrip}>
                                {selected.email && (
                                    <div>
                                        <span>Email</span>
                                        <a href={`mailto:${selected.email}`}>{selected.email}</a>
                                    </div>
                                )}
                                {selected.phone && (
                                    <div>
                                        <span>Phone</span>
                                        <a
                                            href={`tel:${String(selected.phone).replace(/\s/g, "")}`}
                                        >
                                            {selected.phone}
                                        </a>
                                    </div>
                                )}
                                {(selected.suburb || selected.preferredSuburb) && (
                                    <div>
                                        <span>Suburb</span>
                                        <strong>
                                            {selected.suburb || selected.preferredSuburb}
                                        </strong>
                                    </div>
                                )}
                            </div>

                            {/* Documents */}
                            <section className={styles.detailSection}>
                                <h3>
                                    Documents
                                    {documents.length > 0 ? ` (${documents.length})` : ""}
                                </h3>
                                {!documents.length && (
                                    <p className={styles.mutedNote}>
                                        {selected.documentNames
                                            ? `Notes only: ${selected.documentNames}`
                                            : "No files were uploaded with this submission."}
                                    </p>
                                )}
                                {documents.length > 0 && (
                                    <ul className={styles.docList}>
                                        {documents.map((doc, idx) => (
                                            <li key={`${doc.url}-${idx}`} className={styles.docItem}>
                                                <div className={styles.docInfo}>
                                                    <strong>{doc.name}</strong>
                                                    <span>
                                                        {doc.contentType || "File"}
                                                        {doc.size
                                                            ? ` · ${formatFileSize(doc.size)}`
                                                            : ""}
                                                    </span>
                                                </div>
                                                {doc.url ? (
                                                    <div className={styles.docActions}>
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline btn-sm"
                                                        >
                                                            View
                                                        </a>
                                                        <a
                                                            href={doc.url}
                                                            download={doc.name}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Download
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className={styles.mutedNote}>
                                                        No download link
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            {/* Field sections */}
                            {sections.map((sec) => (
                                <section key={sec.title} className={styles.detailSection}>
                                    <h3>{sec.title}</h3>
                                    <dl className={styles.detailGrid}>
                                        {sec.fields.map((field) => (
                                            <div key={`${sec.title}-${field.label}`}>
                                                <dt>{field.label}</dt>
                                                <dd>
                                                    {field.label === "Message" ||
                                                        field.value.length > 120 ? (
                                                        <pre className={styles.detailPre}>
                                                            {field.value}
                                                        </pre>
                                                    ) : (
                                                        field.value
                                                    )}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </AdminShell>
    );
}
