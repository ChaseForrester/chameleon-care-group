/** Detect HTML blog bodies vs legacy markdown-style plain text. */
export function looksLikeHtml(value) {
    if (!value || typeof value !== "string") return false;
    return /<\/?(p|h[1-6]|ul|ol|li|strong|em|a|br|div|blockquote)\b/i.test(value);
}

/** Strip dangerous tags/attrs before rendering CMS HTML. */
export function sanitizeBlogHtml(html) {
    if (!html) return "";
    let out = String(html);
    // Remove scripts, iframes, objects, event handlers
    out = out.replace(/<\s*(script|iframe|object|embed|form|link|meta|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
    out = out.replace(/<\s*(script|iframe|object|embed|form|link|meta|style)[^>]*\/?\s*>/gi, "");
    out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    out = out.replace(/javascript\s*:/gi, "");
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
            return `<p>${escapeText(t).replace(/\n/g, "<br/>")}</p>`;
        })
        .join("\n");
}

function escapeText(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
