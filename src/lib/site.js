/** Canonical site URL for SEO metadata (works on Vercel previews + prod). */
export function getSiteUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    // Prefer production custom domain on Vercel production deploys
    if (process.env.VERCEL_ENV === "production") {
        return "https://www.chameleoncaregroup.com.au";
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "https://www.chameleoncaregroup.com.au";
}
