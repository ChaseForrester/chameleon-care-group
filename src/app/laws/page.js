import Image from "next/image";
import Link from "next/link";
import styles from "../legal.module.css";
import { KEY_LAWS } from "@/lib/legalDocs";
import Reveal from "@/components/Reveal";
import LegalDocsGrid from "@/components/LegalDocsGrid";

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

                    <LegalDocsGrid />

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
