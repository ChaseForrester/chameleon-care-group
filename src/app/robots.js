import { getSiteUrl } from "@/lib/site";

export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/admin/"],
        },
        sitemap: `${getSiteUrl()}/sitemap.xml`,
    };
}
