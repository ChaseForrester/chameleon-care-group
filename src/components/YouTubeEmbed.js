"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./YouTubeEmbed.module.css";

/**
 * Performance-friendly YouTube embed:
 * - loads thumbnail only until near viewport
 * - autoplay is muted (browser policy) + lazy iframe
 * - respects prefers-reduced-motion (no autoplay)
 */
export default function YouTubeEmbed({
    videoId,
    title = "NDIS video",
    autoplay = true,
}) {
    const ref = useRef(null);
    const [active, setActive] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setReducedMotion(
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        );
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActive(true);
                    io.disconnect();
                }
            },
            { rootMargin: "120px 0px", threshold: 0.15 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const shouldAutoplay = autoplay && !reducedMotion;
    const params = new URLSearchParams({
        rel: "0",
        modestbranding: "1",
        playsinline: "1",
        ...(shouldAutoplay && active
            ? { autoplay: "1", mute: "1", loop: "1", playlist: videoId }
            : {}),
    });

    const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return (
        <div ref={ref} className={styles.wrap}>
            {active ? (
                <iframe
                    className={styles.frame}
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`}
                    title={title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            ) : (
                <button
                    type="button"
                    className={styles.poster}
                    onClick={() => setActive(true)}
                    aria-label={`Play video: ${title}`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt="" className={styles.thumb} width={640} height={360} />
                    <span className={styles.play} aria-hidden>
                        ▶
                    </span>
                </button>
            )}
        </div>
    );
}
