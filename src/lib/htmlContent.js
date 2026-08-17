/** Detect HTML blog bodies vs legacy markdown-style plain text. */
export function looksLikeHtml(value) {
    if (!value || typeof value !== "string") return false;
    return /<\/?(p|h[1-6]|ul|ol|li|strong|em|b|i|u|a|br|div|blockquote|img|figure|figcaption|iframe|video|source|span)\b/i.test(
        value
    );
}

const YT_ID =
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
const VIMEO_ID = /(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i;

export function parseVideoUrl(input) {
    const raw = String(input || "").trim();
    if (!raw) return null;

    const yt = raw.match(YT_ID);
    if (yt?.[1]) {
        const id = yt[1].replace(/[^A-Za-z0-9_-]/g, "").slice(0, 11);
        if (!id) return null;
        return {
            type: "youtube",
            id,
            embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        };
    }

    const vm = raw.match(VIMEO_ID);
    if (vm?.[1]) {
        return {
            type: "vimeo",
            id: vm[1],
            embedUrl: `https://player.vimeo.com/video/${vm[1]}`,
        };
    }

    if (/^https?:\/\//i.test(raw) && /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(raw)) {
        return { type: "file", embedUrl: raw };
    }

    return null;
}

export function isSafeMediaUrl(url) {
    const s = String(url || "").trim();
    if (!s || /^javascript:/i.test(s) || /^data:/i.test(s)) return false;
    if (s.startsWith("/") && !s.startsWith("//")) return true;
    try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

export function normalizeHref(url) {
    const t = String(url || "").trim();
    if (!t || t === "https://" || t === "http://") return "";
    if (/^(https?:\/\/|mailto:|tel:|#)/i.test(t)) return t;
    if (t.startsWith("/") && !t.startsWith("//")) return t;
    if (/^www\./i.test(t)) return `https://${t}`;
    if (/^[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i.test(t)) return `https://${t}`;
    return "";
}

export function contentIsEmpty(html) {
    if (!html) return true;
    if (/<(img|iframe|video|source|figure)\b/i.test(html)) return false;
    const text = String(html)
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
    return !text;
}

export function videoEmbedHtml(url, title = "Video") {
    const parsed = parseVideoUrl(url);
    if (!parsed) return "";
    if (parsed.type === "file") {
        return `<figure class="blog-video"><video src="${escapeAttr(parsed.embedUrl)}" controls playsinline preload="metadata"></video></figure>`;
    }
    return `<figure class="blog-embed">${trustedIframeHtml(parsed.embedUrl, title)}</figure>`;
}

export function imageFigureHtml(src, alt = "", dims = {}) {
    if (!isSafeMediaUrl(src)) return "";
    const width = toPixelAttr(dims.width);
    const height = toPixelAttr(dims.height);
    const size =
        width && height ? ` width="${width}" height="${height}"` : "";
    return `<figure class="blog-figure"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${size} /></figure>`;
}

export function uploadedVideoHtml(src) {
    if (!isSafeMediaUrl(src)) return "";
    return `<figure class="blog-video"><video src="${escapeAttr(src)}" controls playsinline preload="metadata"></video></figure>`;
}

export function galleryHtml(items) {
    const figures = (items || [])
        .map((item) =>
            imageFigureHtml(item.src || item.url, item.alt || "", {
                width: item.width,
                height: item.height,
            })
        )
        .filter(Boolean)
        .join("");
    if (!figures) return "";
    return `<div class="blog-gallery">${figures}</div>`;
}

function trustedIframeHtml(src, title) {
    return `<iframe src="${escapeAttr(src)}" title="${escapeAttr(title || "Video")}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function getAttr(tag, name) {
    const m = String(tag).match(
        new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")
    );
    if (!m) return "";
    return decodeHtml(m[2] ?? m[3] ?? m[4] ?? "");
}

function decodeHtml(s) {
    return String(s)
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function rewriteIframe(tag) {
    const src = getAttr(tag, "src");
    const title = getAttr(tag, "title") || "Video";
    const parsed = parseVideoUrl(src);
    if (!parsed || parsed.type === "file") return "";
    return trustedIframeHtml(parsed.embedUrl, title);
}

function toPixelAttr(value) {
    const raw = String(value ?? "").trim();
    if (!raw || /%|em|rem|vw|vh/i.test(raw)) return "";
    const n = parseInt(raw.replace(/px$/i, ""), 10);
    return Number.isFinite(n) && n > 0 && n <= 10000 ? String(n) : "";
}

function normalizeSizeValue(val) {
    const v = String(val || "").trim();
    if (/^auto$/i.test(v)) return "auto";
    const pct = v.match(/^(\d+(\.\d+)?)%$/);
    if (pct) return `${parseFloat(pct[1])}%`;
    const px = v.match(/^(\d+(\.\d+)?)(px)?$/i);
    if (px) return `${Math.round(parseFloat(px[1]))}px`;
    const inch = v.match(/^(\d+(\.\d+)?)in$/i);
    if (inch) return `${Math.round(parseFloat(inch[1]) * 96)}px`;
    const cm = v.match(/^(\d+(\.\d+)?)cm$/i);
    if (cm) return `${Math.round(parseFloat(cm[1]) * 37.8)}px`;
    return "";
}

function styleDecl(style, prop) {
    const m = String(style || "").match(
        new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i")
    );
    return m ? m[1].trim() : "";
}

function sanitizeSizeStyle(style) {
    if (!style) return "";
    const parts = [];
    for (const prop of ["width", "height", "max-width", "max-height"]) {
        const raw = styleDecl(style, prop);
        const val = normalizeSizeValue(raw);
        if (val) parts.push(`${prop}: ${val}`);
    }
    return parts.join("; ");
}

function allowedImgClass(value) {
    return String(value || "")
        .split(/\s+/)
        .filter((c) => /^(blog-[\w-]+|align(left|right|center))$/.test(c))
        .join(" ");
}

function rewriteImg(tag) {
    const src = getAttr(tag, "src");
    const alt = getAttr(tag, "alt") || "";
    if (!isSafeMediaUrl(src)) return "";

    const style = sanitizeSizeStyle(getAttr(tag, "style"));
    let width = toPixelAttr(getAttr(tag, "width"));
    let height = toPixelAttr(getAttr(tag, "height"));
    if (!width) width = toPixelAttr(normalizeSizeValue(styleDecl(style, "width")));
    if (!height) height = toPixelAttr(normalizeSizeValue(styleDecl(style, "height")));
    const cls = allowedImgClass(getAttr(tag, "class"));

    let out = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"`;
    if (width) out += ` width="${width}"`;
    if (height) out += ` height="${height}"`;
    if (style) out += ` style="${escapeAttr(style)}"`;
    if (cls) out += ` class="${escapeAttr(cls)}"`;
    out += " />";
    return out;
}

function rewriteAnchor(tag, inner) {
    const href = normalizeHref(getAttr(tag, "href"));
    if (!href) return inner || "";
    const external = /^https?:\/\//i.test(href);
    const rel = external ? ' rel="noopener noreferrer"' : "";
    const target = external ? ' target="_blank"' : "";
    return `<a href="${escapeAttr(href)}"${target}${rel}>${inner}</a>`;
}

function rewriteVideo(tag, inner) {
    let src = getAttr(tag, "src");
    if (!src && inner) {
        const source = inner.match(/<source\b[^>]*>/i);
        if (source) src = getAttr(source[0], "src");
    }
    if (!isSafeMediaUrl(src)) return "";
    return `<video src="${escapeAttr(src)}" controls playsinline preload="metadata"></video>`;
}

function embedBareVideoUrls(html) {
    return html.replace(
        /<p(?:\s[^>]*)?>\s*(?:<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>|((?:https?:\/\/)[^\s<]+))\s*<\/p>/gi,
        (full, href, text) => {
            const url = String(href || text || "").trim();
            const parsed = parseVideoUrl(url);
            if (!parsed) return full;
            return videoEmbedHtml(url);
        }
    );
}

/** Strip dangerous tags/attrs before rendering CMS HTML. Keeps images, embeds, links. */
export function sanitizeBlogHtml(html) {
    if (!html) return "";
    let out = String(html);

    out = out.replace(/<!--[\s\S]*?-->/g, "");
    out = out.replace(
        /<\s*(script|object|embed|form|link|meta|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
        ""
    );
    out = out.replace(
        /<\s*(script|object|embed|form|link|meta|style)[^>]*\/?\s*>/gi,
        ""
    );

    out = out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, rewriteIframe);
    out = out.replace(/<iframe\b[^>]*\/?>/gi, rewriteIframe);

    out = out.replace(/<video\b([^>]*)>([\s\S]*?)<\/video>/gi, (_, attrs, inner) =>
        rewriteVideo(`<video ${attrs}>`, inner)
    );
    out = out.replace(/<video\b([^>]*)\/?>/gi, (_, attrs) =>
        rewriteVideo(`<video ${attrs}>`, "")
    );

    out = out.replace(/<img\b[^>]*\/?>/gi, rewriteImg);

    out = out.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) =>
        rewriteAnchor(`<a ${attrs}>`, inner)
    );

    out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    out = out.replace(/javascript\s*:/gi, "");

    return embedBareVideoUrls(out);
}

/** Word / Docs paste: keep structure, drop office junk, then sanitize. */
export function sanitizePastedHtml(html) {
    let out = String(html || "");
    out = out.replace(/<!--[\s\S]*?-->/g, "");
    out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
    out = out.replace(/<xml[\s\S]*?<\/xml>/gi, "");
    out = out.replace(/<\/?o:[^>]*>/gi, "");
    out = out.replace(/<([a-z][a-z0-9]*)\b([^>]*)>/gi, (full, name, rest) => {
        if (/^img$/i.test(name)) return full;
        return `<${name}${rest.replace(/\s(?:class|style)=("([^"]*)"|'([^']*)')/gi, "")}>`;
    });
    return sanitizeBlogHtml(out);
}

/**
 * Final pass before Firestore write. Throws if the body cannot be stored
 * (base64 images blow past the 1MB document limit).
 */
export function prepareBlogHtml(html) {
    const out = sanitizeBlogHtml(html);
    if (/src=["']data:/i.test(String(html || ""))) {
        throw new Error(
            "Pasted pictures cannot be published. Use the Image button (or paste the file) so they upload first."
        );
    }
    const bytes = typeof TextEncoder !== "undefined"
        ? new TextEncoder().encode(out).length
        : out.length;
    if (bytes > 900000) {
        throw new Error(
            "This article is too large to publish. Upload images and videos instead of pasting them into the body."
        );
    }
    return out;
}

/** Convert legacy markdown-ish content into simple HTML paragraphs. */
export function legacyContentToHtml(content) {
    if (!content) return "";
    if (looksLikeHtml(content)) return sanitizeBlogHtml(content);

    const blocks = String(content).split(/\n\n+/);
    return blocks
        .map((block) => {
            const t = block.trim();
            if (!t) return "";
            if (t.startsWith("## ")) {
                return `<h2>${escapeText(t.replace(/^##\s+/, ""))}</h2>`;
            }
            if (t.startsWith("### ")) {
                return `<h3>${escapeText(t.replace(/^###\s+/, ""))}</h3>`;
            }
            if (t.split("\n").every((line) => line.trim().startsWith("- "))) {
                const items = t
                    .split("\n")
                    .map((line) => line.replace(/^\s*-\s+/, "").trim())
                    .filter(Boolean)
                    .map((li) => `<li>${escapeText(li)}</li>`)
                    .join("");
                return `<ul>${items}</ul>`;
            }
            const asVideo = parseVideoUrl(t);
            if (asVideo && !/\s/.test(t)) {
                return videoEmbedHtml(t);
            }
            return `<p>${escapeText(t).replace(/\n/g, "<br/>")}</p>`;
        })
        .join("\n");
}

export function escapeText(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function escapeAttr(s) {
    return escapeText(s).replace(/'/g, "&#39;");
}
