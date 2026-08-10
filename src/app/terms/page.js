import Link from "next/link";
import styles from "../legal.module.css";
import { SITE } from "@/lib/seedData";

export const metadata = {
    title: "Terms and Conditions",
    description:
        "Terms of use for the Chameleon Care Group website and service enquiries, including NDIS support bookings.",
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
                        Legal
                    </span>
                    <h1>Terms and Conditions</h1>
                    <p>Last updated: August 2026.</p>
                </div>
            </section>

            <section className="section">
                <div className={`container ${styles.prosePage}`}>
                    <p className={styles.lead}>
                        These Terms and Conditions (&quot;Terms&quot;) govern your use of
                        the Chameleon Care Group website and online forms. Separate service
                        agreements apply when you engage us to deliver supports.
                    </p>

                    <h2>1. Acceptance</h2>
                    <p>
                        By using this website or submitting a form, you agree to these
                        Terms and our{" "}
                        <Link href="/privacy">Privacy Policy</Link>. If you do not agree,
                        please do not use the site.
                    </p>

                    <h2>2. About our services</h2>
                    <p>
                        Website content is general information about our NDIS, aged care and
                        nursing supports. It is not medical advice, legal advice, or a
                        guarantee of funding, availability or outcomes. Individual supports
                        are confirmed after assessment, capacity checks and agreement.
                    </p>

                    <h2>3. Online applications and enquiries</h2>
                    <ul>
                        <li>
                            You must provide accurate and complete information in booking,
                            contact and referral forms.
                        </li>
                        <li>
                            Submitting a form does not create a care contract until we confirm
                            in writing (or as otherwise agreed).
                        </li>
                        <li>
                            We may decline or refer enquiries where we cannot safely meet
                            needs or do not have capacity.
                        </li>
                        <li>
                            Health and sensitive information is handled under our Privacy
                            Policy and applicable law.
                        </li>
                    </ul>

                    <h2>4. NDIS and third parties</h2>
                    <p>
                        Where supports are funded under an NDIS plan, plan rules, reasonable
                        and necessary criteria, and plan manager / self-managed arrangements
                        apply. You remain responsible for ensuring sufficient funding and
                        for any gap payments agreed in writing.
                    </p>

                    <h2>5. Website use</h2>
                    <ul>
                        <li>Do not misuse the site or attempt unauthorised access.</li>
                        <li>
                            Content, branding and materials are owned by CCG or licensors and
                            may not be copied for commercial use without permission.
                        </li>
                        <li>
                            Links to third-party sites (e.g. NDIS Commission) are provided for
                            convenience; we are not responsible for their content.
                        </li>
                    </ul>

                    <h2>6. Downloads and documents</h2>
                    <p>
                        Downloadable PDFs (Code of Conduct summaries, rights charters,
                        policies) are plain-language guides for participants and staff.
                        They are not legal advice and may not reflect every official update.
                        Always check official regulators for current law.
                    </p>

                    <h2>7. Liability</h2>
                    <p>
                        To the extent permitted by law (including the Australian Consumer
                        Law), we exclude liability for loss arising from use of this website
                        or reliance on general online content. Nothing in these Terms
                        excludes non-excludable consumer guarantees.
                    </p>

                    <h2>8. Cancellations and service terms</h2>
                    <p>
                        Specific cancellation, notice and fee terms for booked supports are
                        set out in your service agreement or written confirmation. After-hours
                        urgent matters should be raised by phone where possible.
                    </p>

                    <h2>9. Governing law</h2>
                    <p>
                        These Terms are governed by the laws of New South Wales, Australia.
                    </p>

                    <h2>10. Contact</h2>
                    <p>
                        Questions about these Terms:{" "}
                        <a href={SITE.emailHref}>{SITE.email}</a> ·{" "}
                        <a href={SITE.phoneHref}>{SITE.phone}</a>
                    </p>

                    <div className={styles.actions}>
                        <Link href="/privacy" className="btn btn-outline">
                            Privacy Policy
                        </Link>
                        <Link href="/laws" className="btn btn-primary">
                            Laws & compliance PDFs
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
