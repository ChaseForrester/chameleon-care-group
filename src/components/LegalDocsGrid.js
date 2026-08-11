"use client";

import { useEffect, useMemo, useState } from "react";
import { LEGAL_PDFS } from "@/lib/legalDocs";
import styles from "@/app/legal.module.css";

/**
 * Public laws documents grid — loads CMS overrides from Firestore when available.
 */
export default function LegalDocsGrid() {
    const [docs, setDocs] = useState(
        LEGAL_PDFS.map((d) => ({ ...d, published: true }))
    );

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { getLegalDocs } = await import("@/lib/cms");
                const data = await getLegalDocs({ includeUnpublished: false });
                if (alive && Array.isArray(data) && data.length) {
                    setDocs(data);
                }
            } catch {
                /* keep seed */
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const categories = useMemo(() => {
        const preferred = ["Forms", "Pricing"];
        const rest = [
            ...new Set(
                docs.map((d) => d.category).filter((c) => c && !preferred.includes(c))
            ),
        ];
        return [
            ...preferred.filter((c) => docs.some((d) => d.category === c)),
            ...rest,
        ];
    }, [docs]);

    if (!docs.length) {
        return <p>Documents will appear here soon.</p>;
    }

    return (
        <>
            {categories.map((cat) => (
                <div key={cat} className={styles.docSection}>
                    <h2>{cat}</h2>
                    <div className={styles.docGrid}>
                        {docs
                            .filter((d) => d.category === cat)
                            .map((doc) => (
                                <article key={doc.id} className={`card ${styles.docCard}`}>
                                    <span className="badge">PDF</span>
                                    <h3>{doc.title}</h3>
                                    <p>{doc.description}</p>
                                    <div className={styles.docActions}>
                                        {doc.file && (
                                            <a
                                                href={doc.file}
                                                className="btn btn-primary btn-sm"
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Download PDF
                                            </a>
                                        )}
                                        {doc.externalUrl && (
                                            <a
                                                href={doc.externalUrl}
                                                className="btn btn-outline btn-sm"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {doc.externalLabel || "Official source"}
                                            </a>
                                        )}
                                    </div>
                                </article>
                            ))}
                    </div>
                </div>
            ))}
        </>
    );
}
