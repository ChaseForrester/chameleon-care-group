"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    DEFAULT_BLOGS,
    DEFAULT_OFFERS,
    DEFAULT_SERVICES,
    DEFAULT_STORIES,
} from "@/lib/seedData";
import ShareButtons from "@/components/ShareButtons";

/** Match cms.cleanStoryText — keep public bundle free of heavy imports when possible */
function cleanStoryText(value) {
    if (value == null) return "";
    return String(value)
        .replace(/[\u002D\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D\u00AD]+/g, "-")
        .replace(/[\u2018\u2019\u02BC]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\uFEFF]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function formatStoryForDisplay(raw) {
    const seed = DEFAULT_STORIES.find((d) => d.id === raw.id);
    let name = cleanStoryText(raw.name || seed?.name || "");
    let location = cleanStoryText(raw.location || seed?.location || "");
    let quote = cleanStoryText(raw.quote || seed?.quote || "");

    // Strip person name if it was glued into location
    if (location && name && location.toLowerCase().startsWith(name.toLowerCase())) {
        location = location.slice(name.length).replace(/^[\s,\-]+/, "").trim();
    }

    // Webflow import used "Central Coast – Gosford" (en-dash). Show suburb only.
    if (/gosford/i.test(location)) {
        location = "Gosford";
    } else if (location) {
        location = location
            .replace(/\s*-\s*/g, ", ")
            .replace(/,\s*,+/g, ",")
            .replace(/^,\s*|\s*,$/g, "")
            .trim();
    }

    // Fall back to seed if CMS data looks corrupted
    if (!quote && seed?.quote) quote = cleanStoryText(seed.quote);
    if (!name && seed?.name) name = cleanStoryText(seed.name);

    return { ...raw, name, location, quote };
}

function useCmsList(kind, fallback) {
    const [items, setItems] = useState(fallback);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                // Dynamic import keeps Firebase off the initial public bundle
                const cms = await import("@/lib/cms");
                let data;
                if (kind === "blogs") data = await cms.getBlogs({ publishedOnly: true });
                else if (kind === "stories")
                    data = await cms.getStories({ publishedOnly: true });
                else if (kind === "offers")
                    data = await cms.getOffers({ publishedOnly: true });
                else if (kind === "services")
                    data = await cms.getServices({ publishedOnly: true });

                if (!alive) return;

                // Stories: always replace with CMS result (already deduped in getStories).
                if (kind === "stories") {
                    if (Array.isArray(data)) {
                        setItems(
                            data
                                .filter((s) => s && s.consent !== false && s.published !== false)
                                .map(formatStoryForDisplay)
                        );
                    }
                    return;
                }

                // Blogs: always use CMS list (includes admin posts + seed).
                // Previously a failed composite query fell back to seed-only forever.
                if (kind === "blogs") {
                    if (Array.isArray(data) && data.length) {
                        const fixed = data.map((item) => {
                            let coverImage = item.coverImage || item.image || "";
                            if (typeof coverImage === "string") {
                                coverImage = coverImage
                                    .replace(/\.webp$/i, ".jpg")
                                    .replace(/\.png$/i, ".jpg");
                                // Keep Firebase / remote URLs and local /images paths
                                if (
                                    coverImage &&
                                    !coverImage.startsWith("/images/") &&
                                    !coverImage.startsWith("http") &&
                                    !coverImage.startsWith("data:")
                                ) {
                                    coverImage = "";
                                }
                            }
                            return { ...item, coverImage };
                        });
                        setItems(fixed);
                    }
                    return;
                }

                if (data?.length) {
                    // Prefer local /images paths that exist; fix stale .png/.webp CMS paths
                    const fixed = data.map((item) => {
                        let image = item.image || item.coverImage;
                        if (typeof image === "string") {
                            image = image.replace(/\.webp$/i, ".jpg").replace(/\.png$/i, ".jpg");
                            if (!image.startsWith("/images/") && !image.startsWith("http")) {
                                image = null;
                            }
                        }
                        if (item.image != null && image) return { ...item, image };
                        if (item.coverImage != null && image) return { ...item, coverImage: image };
                        return item;
                    });
                    setItems(fixed);
                }
            } catch {
                /* keep fallback */
            }
        })();
        return () => {
            alive = false;
        };
    }, [kind]);

    return items;
}

export function BlogGrid({ styles }) {
    const items = useCmsList(
        "blogs",
        DEFAULT_BLOGS.filter((b) => b.published)
    );

    return (
        <div className={styles.grid}>
            {items.map((post) => {
                const href = `/blog/${post.slug || post.id}`;
                return (
                    <article key={post.id} className={`card ${styles.card}`}>
                        <Link href={href} className={styles.cardLink}>
                            <div className={styles.cover}>
                                {post.coverImage && (
                                    <Image
                                        src={
                                            post.coverImage.endsWith(".webp")
                                                ? post.coverImage.replace(".webp", ".jpg")
                                                : post.coverImage
                                        }
                                        alt={post.title || ""}
                                        width={640}
                                        height={360}
                                        sizes="(max-width: 720px) 100vw, 50vw"
                                        loading="lazy"
                                        quality={80}
                                    />
                                )}
                            </div>
                            <div className={styles.body}>
                                <div className={styles.tags}>
                                    {(post.tags || []).slice(0, 3).map((t) => (
                                        <span key={t} className="badge">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <h2>{post.title}</h2>
                                <p>{post.excerpt}</p>
                                <span className={styles.read}>Read article →</span>
                            </div>
                        </Link>
                        <div className={styles.cardShare}>
                            <ShareButtons
                                url={href}
                                title={post.title}
                                text={post.excerpt || ""}
                                image={post.coverImage || ""}
                                compact
                                label="Share"
                            />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export function StoriesGrid({ styles }) {
    const items = useCmsList(
        "stories",
        DEFAULT_STORIES.filter((s) => s.published && s.consent).map(formatStoryForDisplay)
    );

    // Final guard: unique by id, then by name+quote (matches admin getStories)
    const seenIds = new Set();
    const seenContent = new Set();
    const unique = [];
    for (const raw of items) {
        const s = formatStoryForDisplay(raw);
        if (!s.name || !s.quote) continue;
        if (s.consent === false || s.published === false) continue;
        if (s.id && seenIds.has(s.id)) continue;
        const contentKey = `${s.name.toLowerCase()}|${s.quote.toLowerCase().slice(0, 160)}`;
        if (seenContent.has(contentKey)) continue;
        if (s.id) seenIds.add(s.id);
        seenContent.add(contentKey);
        unique.push(s);
    }

    return (
        <div className={styles.grid}>
            {unique.map((s) => {
                const shareTitle = `${s.name} - Success story | Chameleon Care Group`;
                const shareText = s.quote
                    ? `"${s.quote}" - ${s.name}${s.location ? `, ${s.location}` : ""}`
                    : shareTitle;
                return (
                    <article key={s.id || contentKeySafe(s)} className={`card ${styles.card}`}>
                        <p className={styles.quote}>&ldquo;{s.quote}&rdquo;</p>
                        <footer className={styles.meta}>
                            <strong className={styles.personName}>{s.name}</strong>
                            {s.location ? (
                                <span className={styles.personPlace}>{s.location}</span>
                            ) : null}
                        </footer>
                        <ShareButtons
                            url="/success-stories"
                            title={shareTitle}
                            text={shareText}
                            compact
                            label="Share this story"
                        />
                    </article>
                );
            })}
        </div>
    );
}

function contentKeySafe(s) {
    return `${s.name || "story"}-${(s.quote || "").slice(0, 24)}`.replace(/\s+/g, "-");
}

export function OffersGrid({ styles }) {
    const items = useCmsList(
        "offers",
        DEFAULT_OFFERS.filter((o) => o.published)
    );

    if (!items.length) {
        return <p>No active offers right now — check back soon.</p>;
    }

    return (
        <div className={styles.grid}>
            {items.map((o) => (
                <article key={o.id} className={`card ${styles.card}`}>
                    {o.badge && <span className="badge badge-accent">{o.badge}</span>}
                    <h2>{o.title}</h2>
                    <p>{o.description}</p>
                    <Link href={o.ctaHref || "/book-with-us"} className="btn btn-primary">
                        {o.ctaLabel || "Learn more"}
                    </Link>
                </article>
            ))}
        </div>
    );
}

export function ServicesList({ styles }) {
    const items = useCmsList("services", DEFAULT_SERVICES);

    return (
        <div className={styles.list}>
            {items.map((s, i) => (
                <article
                    key={s.id}
                    id={s.id}
                    className={`${styles.item} ${i % 2 === 1 ? styles.reverse : ""}`}
                >
                    <div className={styles.media}>
                        {s.image && (
                            <Image
                                src={
                                    s.image.endsWith(".webp")
                                        ? s.image.replace(".webp", ".jpg")
                                        : s.image
                                }
                                alt={s.title || ""}
                                fill
                                sizes="(max-width: 900px) 100vw, 50vw"
                                loading="lazy"
                                quality={80}
                                style={{ objectFit: "cover" }}
                            />
                        )}
                    </div>
                    <div className={styles.content}>
                        <span className="badge">Service</span>
                        <h2>{s.title}</h2>
                        <p>{s.description}</p>
                        <ul>
                            {(s.features || []).map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                        <Link href="/book-with-us" className="btn btn-primary">
                            Enquire about this service
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}
