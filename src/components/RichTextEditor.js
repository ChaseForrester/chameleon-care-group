"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./RichTextEditor.module.css";

/**
 * Lightweight rich-text editor (contentEditable + toolbar).
 * Stores HTML suitable for blog bodies.
 */
export default function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Write your article…",
    minHeight = 280,
}) {
    const ref = useRef(null);
    const lastHtml = useRef("");

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

    const run = (command, arg = null) => {
        ref.current?.focus();
        try {
            document.execCommand(command, false, arg);
        } catch {
            /* ignore unsupported */
        }
        emit();
    };

    const onLink = () => {
        const url = window.prompt("Link URL", "https://");
        if (!url) return;
        run("createLink", url);
    };

    const onPaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        document.execCommand("insertText", false, text);
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
                <button type="button" onClick={() => run("removeFormat")} title="Clear formatting">
                    Clear
                </button>
            </div>
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
                suppressContentEditableWarning
            />
        </div>
    );
}
