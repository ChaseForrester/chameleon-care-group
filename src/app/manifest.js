export default function manifest() {
    return {
        name: "Chameleon Care Group",
        short_name: "CCG",
        description:
            "Personalised NDIS, aged care and private nursing across NSW.",
        start_url: "/",
        display: "standalone",
        background_color: "#f7f9fb",
        theme_color: "#0a2a3d",
        icons: [
            {
                src: "/images/logo-icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/images/logo-icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
