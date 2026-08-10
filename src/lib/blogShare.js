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
 * Uses seed defaults + Firestore REST runQuery for published posts.
 */
export async function resolveBlogPost(slug) {
    if (!slug) return null;

    const fromSeed = DEFAULT_BLOGS.find((b) => b.slug === slug || b.id === slug);
    if (fromSeed) return fromSeed;

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
            // Fresh enough for CMS updates; FB scrapers still get current meta
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const rows = await res.json();
        if (!Array.isArray(rows)) return null;
        for (const row of rows) {
            const blog = docToBlog(row.document);
            if (blog && (blog.slug === slug || blog.id === slug)) {
                return blog;
            }
        }
    } catch (err) {
        console.warn("[blogShare] resolveBlogPost failed", err?.message || err);
    }

    return null;
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
