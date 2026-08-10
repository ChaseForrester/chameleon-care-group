"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    getBlogs,
    getOffers,
    getServices,
    getStories,
} from "@/lib/cms";
import {
    DEFAULT_BLOGS,
    DEFAULT_OFFERS,
    DEFAULT_SERVICES,
    DEFAULT_STORIES,
} from "@/lib/seedData";

export function useCmsList(loader, fallback) {
    const [items, setItems] = useState(fallback);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const data = await loader();
                if (alive && data?.length) setItems(data);
            } catch {
                /* keep fallback */
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [loader]);

    return { items, loading };
}

export function BlogGrid({ styles }) {
    const { items } = useCmsList(
        () => getBlogs({ publishedOnly: true }),
        DEFAULT_BLOGS.filter((b) => b.published)
    );

    return (
        <div className={styles.grid}>
            {items.map((post) => (
                <Link
                    key={post.id}
                    href={`/blog/${post.slug || post.id}`}
                    className={`card ${styles.card}`}
                >
                    <div className={styles.cover}>
                        {post.coverImage && (
                            <Image src={post.coverImage} alt="" width={640} height={360} />
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
            ))}
        </div>
    );
}

export function StoriesGrid({ styles }) {
    const { items } = useCmsList(
        () => getStories({ publishedOnly: true }),
        DEFAULT_STORIES.filter((s) => s.published && s.consent)
    );

    return (
        <div className={styles.grid}>
            {items
                .filter((s) => s.consent !== false)
                .map((s) => (
                    <article key={s.id} className={`card ${styles.card}`}>
                        <p className={styles.quote}>&ldquo;{s.quote}&rdquo;</p>
                        <div className={styles.meta}>
                            <strong>{s.name}</strong>
                            <span>{s.location}</span>
                        </div>
                    </article>
                ))}
        </div>
    );
}

export function OffersGrid({ styles }) {
    const { items } = useCmsList(
        () => getOffers({ publishedOnly: true }),
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
                    <Link href={o.ctaHref || "/book"} className="btn btn-primary">
                        {o.ctaLabel || "Learn more"}
                    </Link>
                </article>
            ))}
        </div>
    );
}

export function ServicesList({ styles }) {
    const { items } = useCmsList(
        () => getServices({ publishedOnly: true }),
        DEFAULT_SERVICES
    );

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
                            <Image src={s.image} alt="" width={520} height={360} />
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
                        <Link href="/book" className="btn btn-primary">
                            Enquire about this service
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}
