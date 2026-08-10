import ContactForm from "@/components/ContactForm";
import styles from "./page.module.css";

export const metadata = {
    title: "Referral",
    description:
        "Refer a participant to Chameleon Care Group for NDIS and nursing support.",
};

export default function ReferralPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
                        Referrals
                    </span>
                    <h1>Refer a participant</h1>
                    <p>
                        Support coordinators, planners, hospitals and families — send a
                        referral and we&apos;ll take it from there.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className={`container ${styles.wrap}`}>
                    <div className={styles.copy}>
                        <h2>How referrals work</h2>
                        <p>
                            Include participant details, support needs, plan information (if
                            available) and preferred contact. We&apos;ll acknowledge your
                            referral promptly and coordinate next steps.
                        </p>
                        <ul>
                            <li>NDIS participants & plan managers</li>
                            <li>Support coordinators & planners</li>
                            <li>Hospitals & aged care facilities</li>
                            <li>Families and carers</li>
                        </ul>
                    </div>
                    <ContactForm title="Submit a referral" source="referral" />
                </div>
            </section>
        </>
    );
}
