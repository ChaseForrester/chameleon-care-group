import { REGIONS, slugifySuburb } from "@/lib/locations";
import { resolveAllPublishedBlogs } from "@/lib/blogShare";
import { getSiteUrl } from "@/lib/site";

const BASE = getSiteUrl();

export default async function sitemap() {
    const now = new Date();

    const staticRoutes = [
        { path: "", priority: 1, changeFrequency: "weekly" },
        { path: "/about-us", priority: 0.9, changeFrequency: "monthly" },
        { path: "/services", priority: 0.95, changeFrequency: "monthly" },
        { path: "/book-with-us", priority: 0.95, changeFrequency: "weekly" },
        { path: "/contact-us", priority: 0.9, changeFrequency: "monthly" },
        { path: "/locations", priority: 0.9, changeFrequency: "weekly" },
        { path: "/success-stories", priority: 0.8, changeFrequency: "monthly" },
        { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
        { path: "/offers", priority: 0.7, changeFrequency: "weekly" },
        { path: "/referral", priority: 0.85, changeFrequency: "monthly" },
        { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
        { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
        { path: "/laws", priority: 0.75, changeFrequency: "monthly" },
    ].map(({ path, priority, changeFrequency }) => ({
        url: `${BASE}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
    }));

    const publishedBlogs = await resolveAllPublishedBlogs();
    const blogs = publishedBlogs.map((b) => ({
        url: `${BASE}/blog/${b.slug || b.id}`,
        lastModified: new Date(b.publishedAt || Date.now()),
        changeFrequency: "monthly",
        priority: 0.65,
    }));

    const regions = REGIONS.flatMap((r) => {
        const regionEntry = {
            url: `${BASE}/locations/${r.id}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        };
        const suburbs = r.suburbs.map((s) => ({
            url: `${BASE}/locations/${r.id}/${slugifySuburb(s)}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        }));
        return [regionEntry, ...suburbs];
    });

    return [...staticRoutes, ...blogs, ...regions];
}
