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

function cleanStoryText(value) {
    if (value == null) return "";
    return String(value)
        .replace(/[\u2013\u2014\u2012\u2015\u2212]/g, "-")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\s+/g, " ")
        .trim();
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
                if (alive && data?.length) {
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
        DEFAULT_STORIES.filter((s) => s.published && s.consent)
    );

    return (
        <div className={styles.grid}>
            {items
                .filter((s) => s.consent !== false)
                .map((s) => {
                    const name = cleanStoryText(s.name);
                    const location = cleanStoryText(s.location).replace(/\s*-\s*/g, ", ");
                    const quote = cleanStoryText(s.quote);
                    const shareTitle = `${name} - Success story | Chameleon Care Group`;
                    const shareText = quote
                        ? `"${quote}" - ${name}${location ? `, ${location}` : ""}`
                        : shareTitle;
                    return (
                        <article key={s.id} className={`card ${styles.card}`}>
                            <p className={styles.quote}>&ldquo;{quote}&rdquo;</p>
                            <div className={styles.meta}>
                                <strong>{name}</strong>
                                {location ? <span>{location}</span> : null}
                            </div>
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
