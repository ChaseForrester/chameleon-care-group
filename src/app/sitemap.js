import { REGIONS, slugifySuburb } from "@/lib/locations";
import { DEFAULT_BLOGS } from "@/lib/seedData";

const BASE = "https://chameleoncaregroup.com.au";

export default function sitemap() {
    const staticRoutes = [
        "",
        "/about",
        "/services",
        "/success-stories",
        "/blog",
        "/offers",
        "/contact",
        "/book",
        "/referral",
        "/locations",
    ].map((path) => ({
        url: `${BASE}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
    }));

    const blogs = DEFAULT_BLOGS.map((b) => ({
        url: `${BASE}/blog/${b.slug}`,
        lastModified: new Date(b.publishedAt || Date.now()),
        changeFrequency: "monthly",
        priority: 0.6,
    }));

    const regions = REGIONS.flatMap((r) => {
        const regionEntry = {
            url: `${BASE}/locations/${r.id}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.75,
        };
        const suburbs = r.suburbs.map((s) => ({
            url: `${BASE}/locations/${r.id}/${slugifySuburb(s)}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.65,
        }));
        return [regionEntry, ...suburbs];
    });

    return [...staticRoutes, ...blogs, ...regions];
}
