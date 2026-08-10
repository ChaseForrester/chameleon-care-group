"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/seedData";
import styles from "./ShareButtons.module.css";

function IconFacebook({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.41-3.68 3.56-3.68 1.03 0 2.11.18 2.11.18v2.33h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.91h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z" />
        </svg>
    );
}

function IconPinterest({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12.04 2C6.52 2 3 5.9 3 10.5c0 2.9 1.63 5.15 4.2 5.15.43 0 .84-.23.95-.5.1-.24.13-.5.08-.77l-.34-1.34c-.1-.4-.16-.57-.16-.77 0-.74.45-1.3 1.02-1.3.48 0 .8.35.8.87 0 .52-.33 1.3-.5 2.02-.14.6.29 1.09.9 1.09 1.08 0 1.81-1.39 1.81-3.03 0-1.25-.89-2.2-2.51-2.2-1.83 0-2.98 1.34-2.98 2.84 0 .52.15.89.4 1.17a.3.3 0 0 1 .08.28l-.15.58c-.05.17-.15.22-.33.13-1.17-.49-1.71-1.8-1.71-3.27 0-2.43 2.05-5.33 6.12-5.33 3.26 0 5.4 2.36 5.4 4.88 0 3.34-1.85 5.84-4.33 5.84-.87 0-1.69-.47-1.97-1.01l-.54 2.05c-.2.74-.73 1.66-1.09 2.22.82.25 1.69.38 2.59.38 5.52 0 9.04-3.9 9.04-8.5C21.08 5.9 17.56 2 12.04 2z" />
        </svg>
    );
}

function IconInstagram({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
    );
}

function IconEmail({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 7 9-7" />
        </svg>
    );
}

function IconLink({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l1.5-1.5a5 5 0 0 0-7.07-7.07l-1.1 1.1" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-1.5 1.5a5 5 0 0 0 7.07 7.07l1.1-1.1" />
        </svg>
    );
}

function IconNativeShare({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="M8.4 13.2l7.2 4.1M15.6 6.7l-7.2 4.1" />
        </svg>
    );
}

/**
 * Share bar for blogs, stories, and any page content.
 *
 * @param {object} props
 * @param {string} [props.url] Absolute or path URL (falls back to current page)
 * @param {string} props.title Share title
 * @param {string} [props.text] Longer description / quote
 * @param {string} [props.image] Absolute image URL for Pinterest
 * @param {boolean} [props.compact] Smaller layout for cards
 * @param {string} [props.label] Heading above buttons
 * @param {string} [props.className]
 */
export default function ShareButtons({
    url,
    title = "Chameleon Care Group",
    text = "",
    image = "",
    compact = false,
    label = "Share",
    className = "",
}) {
    const [pageUrl, setPageUrl] = useState(url || "");
    const [imageUrl, setImageUrl] = useState(image || "");
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const origin = window.location.origin;
        const resolved =
            url && /^https?:\/\//i.test(url)
                ? url
                : url
                    ? `${origin}${url.startsWith("/") ? "" : "/"}${url}`
                    : window.location.href.split("#")[0];
        setPageUrl(resolved);

        if (image) {
            setImageUrl(
                /^https?:\/\//i.test(image)
                    ? image
                    : `${origin}${image.startsWith("/") ? "" : "/"}${image}`
            );
        } else {
            setImageUrl("");
        }

        setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }, [url, image]);

    const shareText = useMemo(() => {
        const bits = [title, text].filter(Boolean);
        return bits.join(" — ").slice(0, 500);
    }, [title, text]);

    const flash = useCallback((msg) => {
        setStatus(msg);
        window.setTimeout(() => setStatus(""), 2600);
    }, []);

    const copyToClipboard = useCallback(
        async (value, successMsg = "Link copied") => {
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(value);
                } else {
                    const ta = document.createElement("textarea");
                    ta.value = value;
                    ta.setAttribute("readonly", "");
                    ta.style.position = "absolute";
                    ta.style.left = "-9999px";
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                }
                flash(successMsg);
                return true;
            } catch {
                flash("Could not copy — long-press the address bar instead");
                return false;
            }
        },
        [flash]
    );

    const openPopup = (href) => {
        if (!href) return;
        window.open(href, "_blank", "noopener,noreferrer,width=640,height=640");
    };

    const onFacebook = () => {
        if (!pageUrl) return;
        openPopup(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
        );
    };

    const onPinterest = () => {
        if (!pageUrl) return;
        const params = new URLSearchParams({
            url: pageUrl,
            description: shareText || title,
        });
        if (imageUrl) params.set("media", imageUrl);
        openPopup(`https://pinterest.com/pin/create/button/?${params.toString()}`);
    };

    const onInstagram = async () => {
        // Instagram has no web share intent for arbitrary links — copy then open IG
        const payload = [shareText, pageUrl].filter(Boolean).join("\n\n");
        await copyToClipboard(
            payload,
            "Copied — paste into Instagram (post, story or DM)"
        );
        const ig = SITE.social?.instagram || "https://www.instagram.com/";
        window.open(ig, "_blank", "noopener,noreferrer");
    };

    const onEmail = () => {
        if (!pageUrl) return;
        const subject = title || "From Chameleon Care Group";
        const body = [text, "", pageUrl, "", "— Chameleon Care Group"].filter(Boolean).join("\n");
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const onCopy = () => {
        if (!pageUrl) return;
        copyToClipboard(pageUrl, "Link copied to clipboard");
    };

    const onNativeShare = async () => {
        if (!pageUrl || !canNativeShare) return;
        try {
            await navigator.share({
                title,
                text: text || title,
                url: pageUrl,
            });
            flash("Shared");
        } catch (err) {
            // User cancelled — ignore AbortError
            if (err?.name !== "AbortError") {
                flash("Share cancelled or unavailable");
            }
        }
    };

    const buttons = [
        {
            id: "facebook",
            label: "Facebook",
            title: "Share on Facebook",
            onClick: onFacebook,
            icon: <IconFacebook />,
            className: styles.facebook,
        },
        {
            id: "pinterest",
            label: "Pinterest",
            title: "Pin on Pinterest",
            onClick: onPinterest,
            icon: <IconPinterest />,
            className: styles.pinterest,
        },
        {
            id: "instagram",
            label: "Instagram",
            title: "Copy for Instagram",
            onClick: onInstagram,
            icon: <IconInstagram />,
            className: styles.instagram,
        },
        {
            id: "email",
            label: "Email",
            title: "Share by email",
            onClick: onEmail,
            icon: <IconEmail />,
            className: styles.email,
        },
        {
            id: "copy",
            label: "Copy link",
            title: "Copy link",
            onClick: onCopy,
            icon: <IconLink />,
            className: styles.copy,
        },
    ];

    if (canNativeShare) {
        buttons.unshift({
            id: "native",
            label: "Share",
            title: "Share via device",
            onClick: onNativeShare,
            icon: <IconNativeShare />,
            className: styles.native,
        });
    }

    return (
        <div
            className={`${styles.wrap} ${compact ? styles.compact : ""} ${className}`.trim()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            {label ? <span className={styles.label}>{label}</span> : null}
            <div className={styles.row} role="group" aria-label={label || "Share options"}>
                {buttons.map((btn) => (
                    <button
                        key={btn.id}
                        type="button"
                        className={`${styles.btn} ${btn.className}`}
                        onClick={btn.onClick}
                        title={btn.title}
                        aria-label={btn.title}
                    >
                        <span className={styles.icon}>{btn.icon}</span>
                        {!compact && <span className={styles.btnLabel}>{btn.label}</span>}
                    </button>
                ))}
            </div>
            <span className={`${styles.status} ${status ? styles.statusVisible : ""}`} role="status" aria-live="polite">
                {status}
            </span>
        </div>
    );
}
