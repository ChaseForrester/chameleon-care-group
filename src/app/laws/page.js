import Link from "next/link";
import styles from "../legal.module.css";
import { KEY_LAWS, LEGAL_PDFS } from "@/lib/legalDocs";

export const metadata = {
    title: "Laws, Policies & Downloadable Documents",
    description:
        "Download NDIS Code of Conduct, participant rights, privacy, incident management and safeguarding summaries. Chameleon Care Group compliance resources.",
    alternates: { canonical: "/laws" },
    openGraph: {
        title: "Laws & Policies | Chameleon Care Group",
        description:
            "Downloadable PDFs covering NDIS Code of Conduct, rights, complaints, privacy and safeguarding.",
    },
};

export default function LawsPage() {
    const categories = [...new Set(LEGAL_PDFS.map((d) => d.category))];

    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
                        Compliance
                    </span>
                    <h1>Laws, policies & documents</h1>
                    <p>
                        Plain-language resources for participants, families and staff.
                        Download PDFs for your records. These summaries do not replace
                        official legislation.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className={styles.notice}>
                        <strong>Important:</strong> Documents on this page are educational
                        summaries prepared for Chameleon Care Group. For the latest official
                        rules, visit the{" "}
                        <a
                            href="https://www.ndiscommission.gov.au"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            NDIS Quality and Safeguards Commission
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://www.legislation.gov.au"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            legislation.gov.au
                        </a>
                        .
                    </div>

                    {categories.map((cat) => (
                        <div key={cat} className={styles.docSection}>
                            <h2>{cat}</h2>
                            <div className={styles.docGrid}>
                                {LEGAL_PDFS.filter((d) => d.category === cat).map((doc) => (
                                    <article key={doc.id} className={`card ${styles.docCard}`}>
                                        <span className="badge">PDF</span>
                                        <h3>{doc.title}</h3>
                                        <p>{doc.description}</p>
                                        <a
                                            href={doc.file}
                                            className="btn btn-primary btn-sm"
                                            download
                                        >
                                            Download PDF
                                        </a>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className={styles.lawList}>
                        <h2>Key laws & frameworks that may apply</h2>
                        <p className={styles.lead}>
                            Depending on the supports delivered, the following frameworks are
                            commonly relevant to NDIS and nursing providers in NSW.
                        </p>
                        <ul>
                            {KEY_LAWS.map((law) => (
                                <li key={law.name}>
                                    <strong>{law.name}</strong>
                                    <span>{law.why}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/privacy" className="btn btn-outline">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="btn btn-outline">
                            Terms & Conditions
                        </Link>
                        <Link href="/book" className="btn btn-primary">
                            Book supports
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
