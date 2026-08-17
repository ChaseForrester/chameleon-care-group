import Image from "next/image";

const OPTIMIZED_HOSTS = new Set([
    "firebasestorage.googleapis.com",
    "chameleon-care-group-au.firebasestorage.app",
    "cdn.prod.website-files.com",
]);

export function isOptimizedImageSrc(src) {
    if (!src || typeof src !== "string") return false;
    if (src.startsWith("data:")) return false;
    if (src.startsWith("/") && !src.startsWith("//")) return true;
    try {
        const u = new URL(src);
        return (
            (u.protocol === "https:" || u.protocol === "http:") &&
            OPTIMIZED_HOSTS.has(u.hostname)
        );
    } catch {
        return false;
    }
}

/**
 * next/image throws (and 500s the page) for unknown remote hosts.
 * CMS cover URLs may be Firebase, local, or any https image — fall back to <img>.
 */
export default function CmsImage({
    src,
    alt = "",
    width,
    height,
    fill,
    sizes,
    quality,
    priority,
    loading,
    style,
    className,
}) {
    if (!src) return null;

    if (isOptimizedImageSrc(src)) {
        return (
            <Image
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                fill={fill}
                sizes={sizes}
                quality={quality}
                priority={priority}
                loading={loading}
                style={style}
                className={className}
            />
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            loading={priority ? "eager" : loading || "lazy"}
            className={className}
            style={
                fill
                    ? { objectFit: "cover", width: "100%", height: "100%", ...style }
                    : style
            }
        />
    );
}
