import { DEFAULT_BLOGS } from "@/lib/seedData";
import { getSiteUrl } from "@/lib/site";

const PROJECT_ID =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "chameleon-care-group-au";
const API_KEY =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAwWFltmWZQYyi17SiAFdpZX3QuAm7whEI";

/** Absolute URL for Open Graph / iMessage / Messenger previews. */
export function absoluteUrl(pathOrUrl = "") {
    const site = getSiteUrl();
    if (!pathOrUrl) return site;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    return `${site}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Prefer a wide cover image for link previews (FB recommends ≥1200×630). */
export function blogShareImage(post) {
    const cover = post?.coverImage || post?.image || "/images/about-hero.jpg";
    return absoluteUrl(cover);
}

function firestoreValue(field) {
    if (!field || typeof field !== "object") return undefined;
    if ("stringValue" in field) return field.stringValue;
    if ("booleanValue" in field) return field.booleanValue;
    if ("integerValue" in field) return Number(field.integerValue);
    if ("doubleValue" in field) return Number(field.doubleValue);
    if ("timestampValue" in field) return field.timestampValue;
    if ("arrayValue" in field) {
        const values = field.arrayValue?.values || [];
        return values.map((v) => firestoreValue(v));
    }
    return undefined;
}

function docToBlog(doc) {
    if (!doc?.fields) return null;
    const f = doc.fields;
    const id = doc.name?.split("/").pop() || "";
    return {
        id,
        title: firestoreValue(f.title) || "",
        slug: firestoreValue(f.slug) || id,
        excerpt: firestoreValue(f.excerpt) || "",
        content: firestoreValue(f.content) || "",
        coverImage: firestoreValue(f.coverImage) || "",
        author: firestoreValue(f.author) || "Chameleon Care Group",
        tags: firestoreValue(f.tags) || [],
        published: firestoreValue(f.published) !== false,
        publishedAt: firestoreValue(f.publishedAt) || firestoreValue(f.createdAt) || null,
    };
}

/**
 * Server-safe blog lookup (no browser Firebase SDK).
 * Prefers live Firestore CMS posts, then seed defaults.
 */
export async function resolveBlogPost(slug) {
    if (!slug) return null;
    const key = String(slug).toLowerCase();

    // 1) Live CMS (published) via Firestore REST — this is where super-admin posts live
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: "blogs" }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: "published" },
                            op: "EQUAL",
                            value: { booleanValue: true },
                        },
                    },
                    limit: 50,
                },
            }),
            // Short revalidate so new admin posts appear quickly
            next: { revalidate: 30 },
        });
        if (res.ok) {
            const rows = await res.json();
            if (Array.isArray(rows)) {
                for (const row of rows) {
                    const blog = docToBlog(row.document);
                    if (
                        blog &&
                        ((blog.slug || "").toLowerCase() === key ||
                            (blog.id || "").toLowerCase() === key)
                    ) {
                        return blog;
                    }
                }
            }
        }
    } catch (err) {
        console.warn("[blogShare] resolveBlogPost failed", err?.message || err);
    }

    // 2) Seed fallbacks (built-in demo posts)
    return (
        DEFAULT_BLOGS.find(
            (b) =>
                (b.slug || "").toLowerCase() === key ||
                (b.id || "").toLowerCase() === key
        ) || null
    );
}

/** All published blogs for sitemap / listing SSR helpers */
export async function resolveAllPublishedBlogs() {
    const bySlug = new Map();

    for (const b of DEFAULT_BLOGS.filter((x) => x.published)) {
        bySlug.set((b.slug || b.id).toLowerCase(), b);
    }

    try {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: "blogs" }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: "published" },
                            op: "EQUAL",
                            value: { booleanValue: true },
                        },
                    },
                    limit: 50,
                },
            }),
            next: { revalidate: 30 },
        });
        if (res.ok) {
            const rows = await res.json();
            if (Array.isArray(rows)) {
                for (const row of rows) {
                    const blog = docToBlog(row.document);
                    if (blog?.slug || blog?.id) {
                        // CMS wins over seed for the same slug
                        bySlug.set((blog.slug || blog.id).toLowerCase(), blog);
                    }
                }
            }
        }
    } catch (err) {
        console.warn("[blogShare] resolveAllPublishedBlogs failed", err?.message || err);
    }

    return Array.from(bySlug.values()).sort((a, b) => {
        const ta = Date.parse(a.publishedAt || a.createdAt || "") || 0;
        const tb = Date.parse(b.publishedAt || b.createdAt || "") || 0;
        return tb - ta;
    });
}

/** Next.js Metadata for rich Facebook / Messenger / iMessage previews. */
export function buildBlogMetadata(post, slug) {
    const siteUrl = getSiteUrl();
    const path = `/blog/${post.slug || slug}`;
    const url = absoluteUrl(path);
    const title = post.title || "Blog";
    const description =
        post.excerpt ||
        (post.content ? String(post.content).replace(/\s+/g, " ").slice(0, 160) : "") ||
        "Insights from Chameleon Care Group.";
    const image = blogShareImage(post);
    const imageAlt = post.title || "Chameleon Care Group";

    return {
        title,
        description,
        alternates: { canonical: path },
        authors: [{ name: post.author || "Chameleon Care Group" }],
        openGraph: {
            type: "article",
            url,
            title,
            description,
            siteName: "Chameleon Care Group",
            locale: "en_AU",
            images: [
                {
                    url: image,
                    secureUrl: image,
                    width: 1200,
                    height: 630,
                    alt: imageAlt,
                    type: "image/jpeg",
                },
            ],
            publishedTime: post.publishedAt || undefined,
            authors: [post.author || "Chameleon Care Group"],
            tags: Array.isArray(post.tags) ? post.tags : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
        other: {
            // Extra hints some crawlers still read
            "og:image:width": "1200",
            "og:image:height": "630",
        },
    };
}

export function blogJsonLd(post, slug) {
    const url = absoluteUrl(`/blog/${post.slug || slug}`);
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || undefined,
        image: [blogShareImage(post)],
        author: {
            "@type": "Organization",
            name: post.author || "Chameleon Care Group",
        },
        publisher: {
            "@type": "Organization",
            name: "Chameleon Care Group",
            logo: {
                "@type": "ImageObject",
                url: absoluteUrl("/images/logo-mark.png"),
            },
        },
        datePublished: post.publishedAt || undefined,
        mainEntityOfPage: url,
        url,
    };
}
