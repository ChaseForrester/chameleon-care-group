import Image from "next/image";
import Link from "next/link";
import styles from "../legal.module.css";
import { KEY_LAWS, LEGAL_PDFS } from "@/lib/legalDocs";
import Reveal from "@/components/Reveal";

export const metadata = {
    title: "Laws, Policies & Downloadable Documents",
    description:
        "Download Referral Form, Intake Form, NDIS Price Guide 2026, Code of Conduct, privacy and safeguarding documents from Chameleon Care Group.",
    alternates: { canonical: "/laws" },
    openGraph: {
        title: "Laws & Policies | Chameleon Care Group",
        description:
            "Referral form, intake form, NDIS Price Guide 2026 and compliance PDFs.",
    },
};

export default function LawsPage() {
    // Keep Forms & Pricing first
    const preferred = ["Forms", "Pricing"];
    const rest = [
        ...new Set(
            LEGAL_PDFS.map((d) => d.category).filter((c) => !preferred.includes(c))
        ),
    ];
    const categories = [...preferred.filter((c) => LEGAL_PDFS.some((d) => d.category === c)), ...rest];

    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
                        Compliance
                    </span>
                    <h1>Laws, policies & documents</h1>
                    <p>
                        Download referral and intake forms, the NDIS Price Guide 2026, and
                        plain-language compliance resources for participants, families and
                        staff.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <Reveal className={styles.heroMedia}>
                        <Image
                            src="/images/clinical-report.jpg"
                            alt="Safe, professional NDIS clinical care documentation"
                            width={1100}
                            height={360}
                        />
                    </Reveal>
                    <div className={styles.notice}>
                        <strong>Important:</strong> Forms and policy PDFs are for Chameleon
                        Care Group. Pricing follows the official NDIA Pricing Schedule —
                        always check{" "}
                        <a
                            href="https://www.ndis.gov.au/providers/pricing-and-payments/pricing/pricing-arrangements"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ndis.gov.au pricing arrangements
                        </a>{" "}
                        for the latest limits. Other rules:{" "}
                        <a
                            href="https://www.ndiscommission.gov.au"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            NDIS Commission
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
                                        <div className={styles.docActions}>
                                            <a
                                                href={doc.file}
                                                className="btn btn-primary btn-sm"
                                                download
                                            >
                                                Download PDF
                                            </a>
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
                        <Link href="/referral" className="btn btn-outline">
                            Online referral
                        </Link>
                        <Link href="/privacy" className="btn btn-outline">
                            Privacy Policy
                        </Link>
                        <Link href="/book-with-us" className="btn btn-primary">
                            Book supports
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
