"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./RichTextEditor.module.css";
import {
    escapeAttr,
    escapeText,
    galleryHtml,
    imageFigureHtml,
    normalizeHref,
    parseVideoUrl,
    sanitizePastedHtml,
    uploadedVideoHtml,
    videoEmbedHtml,
} from "@/lib/htmlContent";

/**
 * Lightweight rich-text editor (contentEditable + toolbar).
 * Stores HTML suitable for blog bodies — images, galleries, video embeds, links.
 */
export default function RichTextEditor({
    value = "",
    onChange,
    onUploadFile,
    onError,
    placeholder = "Write your article…",
    minHeight = 280,
}) {
    const ref = useRef(null);
    const lastHtml = useRef("");
    const savedRange = useRef(null);
    const imageInput = useRef(null);
    const videoInput = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Only sync from props when external value changed (avoid caret jumps)
        if (value !== lastHtml.current && value !== el.innerHTML) {
            el.innerHTML = value || "";
            lastHtml.current = value || "";
        }
    }, [value]);

    const emit = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        const html = el.innerHTML;
        lastHtml.current = html;
        onChange?.(html);
    }, [onChange]);

    const rememberSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) savedRange.current = sel.getRangeAt(0);
    };

    const restoreSelection = () => {
        ref.current?.focus();
        const sel = window.getSelection();
        if (savedRange.current && sel) {
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
        }
    };

    const insertHtml = (html) => {
        if (!html) return;
        restoreSelection();
        try {
            document.execCommand("insertHTML", false, html);
        } catch {
            const el = ref.current;
            if (el) el.insertAdjacentHTML("beforeend", html);
        }
        emit();
    };

    const run = (command, arg = null) => {
        ref.current?.focus();
        try {
            document.execCommand(command, false, arg);
        } catch {
            /* ignore unsupported */
        }
        emit();
    };

    const fail = (message) => {
        onError?.(message);
    };

    const onLink = () => {
        const sel = window.getSelection();
        const selected = sel?.toString() || "";
        const raw = window.prompt(
            "Link URL",
            selected.startsWith("http") ? selected : "https://"
        );
        if (raw == null) return;
        const href = normalizeHref(raw);
        if (!href) {
            fail("Enter a full URL such as https://example.com");
            return;
        }
        if (selected) {
            run("createLink", href);
            const el = ref.current;
            el?.querySelectorAll("a[href]").forEach((a) => {
                if (!/^https?:\/\//i.test(a.getAttribute("href") || "")) return;
                a.setAttribute("target", "_blank");
                a.setAttribute("rel", "noopener noreferrer");
            });
            emit();
            return;
        }
        insertHtml(
            `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeText(href)}</a>`
        );
    };

    const uploadOne = async (file) => {
        if (!onUploadFile) {
            throw new Error("Uploads are not available right now.");
        }
        return onUploadFile(file);
    };

    const onImagesSelected = async (e) => {
        const files = Array.from(e.target.files || []).filter((f) =>
            f.type.startsWith("image/")
        );
        e.target.value = "";
        if (!files.length) return;
        setUploading(true);
        onError?.("");
        try {
            const items = [];
            for (const file of files) {
                const url = await uploadOne(file);
                items.push({
                    src: url,
                    alt: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
                });
            }
            if (items.length === 1) insertHtml(imageFigureHtml(items[0].src, items[0].alt));
            else insertHtml(galleryHtml(items));
        } catch (err) {
            fail(err.message || "Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const onVideoFileSelected = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setUploading(true);
        onError?.("");
        try {
            const url = await uploadOne(file);
            insertHtml(uploadedVideoHtml(url));
        } catch (err) {
            fail(err.message || "Video upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const onVideoUrl = () => {
        const raw = window.prompt(
            "YouTube, Vimeo, or direct video URL",
            "https://"
        );
        if (raw == null) return;
        const html = videoEmbedHtml(raw.trim());
        if (!html) {
            fail("Use a YouTube, Vimeo, or .mp4 / .webm link.");
            return;
        }
        insertHtml(html);
    };

    const onPaste = async (e) => {
        const dt = e.clipboardData;
        if (!dt) return;

        const files = Array.from(dt.files || []).filter(
            (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
        );
        if (files.length && onUploadFile) {
            e.preventDefault();
            setUploading(true);
            onError?.("");
            try {
                const images = [];
                for (const file of files) {
                    const url = await uploadOne(file);
                    if (file.type.startsWith("video/")) {
                        insertHtml(uploadedVideoHtml(url));
                    } else {
                        images.push({
                            src: url,
                            alt: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
                        });
                    }
                }
                if (images.length === 1) {
                    insertHtml(imageFigureHtml(images[0].src, images[0].alt));
                } else if (images.length > 1) {
                    insertHtml(galleryHtml(images));
                }
            } catch (err) {
                fail(err.message || "Could not upload the pasted file.");
            } finally {
                setUploading(false);
            }
            return;
        }

        const text = (dt.getData("text/plain") || "").trim();
        if (text && !/\s/.test(text) && parseVideoUrl(text)) {
            e.preventDefault();
            insertHtml(videoEmbedHtml(text));
            return;
        }

        const html = dt.getData("text/html");
        if (html) {
            e.preventDefault();
            insertHtml(sanitizePastedHtml(html));
            return;
        }

        if (text && !/\s/.test(text) && normalizeHref(text)) {
            e.preventDefault();
            const href = normalizeHref(text);
            insertHtml(
                `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeText(text)}</a>`
            );
            return;
        }

        e.preventDefault();
        document.execCommand("insertText", false, dt.getData("text/plain") || "");
        emit();
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
                <button type="button" onClick={() => run("bold")} title="Bold">
                    <strong>B</strong>
                </button>
                <button type="button" onClick={() => run("italic")} title="Italic">
                    <em>I</em>
                </button>
                <button type="button" onClick={() => run("underline")} title="Underline">
                    <span style={{ textDecoration: "underline" }}>U</span>
                </button>
                <span className={styles.sep} />
                <button type="button" onClick={() => run("formatBlock", "h2")} title="Heading">
                    H2
                </button>
                <button type="button" onClick={() => run("formatBlock", "h3")} title="Subheading">
                    H3
                </button>
                <button type="button" onClick={() => run("formatBlock", "p")} title="Paragraph">
                    ¶
                </button>
                <span className={styles.sep} />
                <button type="button" onClick={() => run("insertUnorderedList")} title="Bullet list">
                    • List
                </button>
                <button type="button" onClick={() => run("insertOrderedList")} title="Numbered list">
                    1. List
                </button>
                <span className={styles.sep} />
                <button type="button" onClick={onLink} title="Insert link">
                    Link
                </button>
                <button type="button" onClick={() => run("unlink")} title="Remove link">
                    Unlink
                </button>
                <button
                    type="button"
                    onClick={() => imageInput.current?.click()}
                    title="Insert images"
                    disabled={uploading || !onUploadFile}
                >
                    Images
                </button>
                <button
                    type="button"
                    onClick={onVideoUrl}
                    title="Embed YouTube or Vimeo"
                    disabled={uploading}
                >
                    Video link
                </button>
                <button
                    type="button"
                    onClick={() => videoInput.current?.click()}
                    title="Upload a video file"
                    disabled={uploading || !onUploadFile}
                >
                    Upload video
                </button>
                <button type="button" onClick={() => run("removeFormat")} title="Clear formatting">
                    Clear
                </button>
                {uploading ? <span className={styles.status}>Uploading…</span> : null}
            </div>
            <input
                ref={imageInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onImagesSelected}
            />
            <input
                ref={videoInput}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                hidden
                onChange={onVideoFileSelected}
            />
            <div
                ref={ref}
                className={styles.editor}
                contentEditable
                role="textbox"
                aria-multiline="true"
                aria-label="Article body"
                data-placeholder={placeholder}
                style={{ minHeight }}
                onInput={emit}
                onBlur={emit}
                onPaste={onPaste}
                onMouseUp={rememberSelection}
                onKeyUp={rememberSelection}
                suppressContentEditableWarning
            />
            <p className={styles.hint}>
                Images accepts several files at once. Paste a YouTube URL for an embed.
                Select text and click Link. Pasted photos are uploaded automatically.
            </p>
        </div>
    );
}
