import Link from "next/link";
import styles from "../legal.module.css";
import { SITE } from "@/lib/seedData";

export const metadata = {
    title: "Privacy Policy",
    description:
        "How Chameleon Care Group collects, uses, stores and protects personal and health information under Australian privacy law and NDIS requirements.",
    alternates: { canonical: "/privacy" },
    openGraph: {
        title: "Privacy Policy | Chameleon Care Group",
        description: "Our commitment to protecting your personal information.",
    },
};

export default function PrivacyPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
                        Legal
                    </span>
                    <h1>Privacy Policy</h1>
                    <p>
                        Last updated: August 2026. This policy explains how Chameleon Care
                        Group handles personal information.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className={`container ${styles.prosePage}`}>
                    <p className={styles.lead}>
                        Chameleon Care Group (&quot;we&quot;, &quot;us&quot;, &quot;CCG&quot;)
                        is committed to protecting the privacy of participants, families,
                        referrers and website visitors in line with the Privacy Act 1988
                        (Cth), the Australian Privacy Principles (APPs), and NDIS quality
                        and safeguarding expectations.
                    </p>

                    <h2>1. Who we are</h2>
                    <p>
                        Chameleon Care Group provides personalised NDIS, aged care and
                        private nursing support across Sutherland Shire, Illawarra, Central
                        Coast and Greater Sydney.
                    </p>
                    <p>
                        Contact:{" "}
                        <a href={SITE.emailHref}>{SITE.email}</a> ·{" "}
                        <a href={SITE.phoneHref}>{SITE.phone}</a>
                    </p>

                    <h2>2. Information we collect</h2>
                    <ul>
                        <li>Identity and contact details (name, address, phone, email)</li>
                        <li>NDIS participant number, plan details and funding information</li>
                        <li>Health, disability and support needs (sensitive information)</li>
                        <li>Emergency contacts, carers and authorised representatives</li>
                        <li>Billing, invoice and organisation details</li>
                        <li>Website enquiry and booking form submissions</li>
                        <li>Service notes and clinical documentation where required</li>
                        <li>
                            Technical data such as browser type and pages visited (if analytics
                            are enabled)
                        </li>
                    </ul>

                    <h2>3. How we collect information</h2>
                    <p>
                        We collect information directly from you (or your authorised
                        representative), via referrals, support coordinators, plan managers,
                        treating practitioners, and our website forms. Where reasonable and
                        lawful, we collect sensitive information only with consent.
                    </p>

                    <h2>4. Why we collect and use information</h2>
                    <ul>
                        <li>To assess needs and deliver safe, person-centred supports</li>
                        <li>To communicate about bookings, care and emergencies</li>
                        <li>To meet NDIS, clinical and workplace obligations</li>
                        <li>To manage billing, invoices and service agreements</li>
                        <li>To handle feedback, complaints and quality improvement</li>
                        <li>To operate and improve our website and services</li>
                    </ul>

                    <h2>5. Disclosure</h2>
                    <p>
                        We may share personal information with plan managers, support
                        coordinators, treating practitioners, emergency services, regulators
                        (including the NDIS Quality and Safeguards Commission), and trusted
                        service providers (for example secure hosting or IT) — only as needed
                        and where permitted by law or your consent.
                    </p>
                    <p>
                        We do not sell personal information.
                    </p>

                    <h2>6. Storage and security</h2>
                    <p>
                        We take reasonable steps to protect personal information from
                        misuse, interference, loss, and unauthorised access. Information may
                        be stored in secure systems including cloud services with appropriate
                        safeguards. No method of transmission is 100% secure; please contact
                        us if you have concerns.
                    </p>

                    <h2>7. Access and correction</h2>
                    <p>
                        You may request access to, or correction of, your personal
                        information by emailing{" "}
                        <a href={SITE.emailHref}>{SITE.email}</a>. We will respond within a
                        reasonable time as required by the APPs.
                    </p>

                    <h2>8. Complaints</h2>
                    <p>
                        If you believe we have breached your privacy, contact us first. If
                        you are not satisfied, you may contact the Office of the Australian
                        Information Commissioner (OAIC):{" "}
                        <a
                            href="https://www.oaic.gov.au"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            oaic.gov.au
                        </a>
                        .
                    </p>

                    <h2>9. Website forms & cookies</h2>
                    <p>
                        Information submitted via our Book In, Contact and Referral forms is
                        used to respond to your enquiry and, where relevant, commence care
                        planning. Essential cookies may be used for site function; any
                        analytics cookies (if enabled) help us understand site usage.
                    </p>

                    <h2>10. Updates</h2>
                    <p>
                        We may update this policy from time to time. The latest version will
                        be published on this page with an updated date.
                    </p>

                    <div className={styles.actions}>
                        <a
                            href="/pdfs/privacy-and-consent-information.pdf"
                            className="btn btn-primary"
                            download
                        >
                            Download privacy & consent PDF
                        </a>
                        <Link href="/laws" className="btn btn-outline">
                            Laws & compliance documents
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
