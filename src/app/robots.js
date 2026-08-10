export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/admin/"],
        },
        sitemap: "https://chameleoncaregroup.com.au/sitemap.xml",
    };
}
