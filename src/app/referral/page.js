import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import styles from "./page.module.css";
import Reveal from "@/components/Reveal";

export const metadata = {
    title: "Referral",
    description:
        "Refer a participant to Chameleon Care Group for NDIS and nursing support.",
    alternates: { canonical: "/referral" },
};

export default function ReferralPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
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
                    <Reveal className={styles.copy}>
                        <div className={styles.photo}>
                            <Image
                                src="/images/service-complex.jpg"
                                alt="NDIS participant receiving personalised support"
                                width={640}
                                height={360}
                            />
                        </div>
                        <h2>How referrals work</h2>
                        <p>
                            Include participant details, support needs, plan information (if
                            available) and preferred contact. We&apos;ll acknowledge your
                            referral promptly and coordinate next steps. Enquiries are sent to
                            our care and Tech Aid coordination inboxes.
                        </p>
                        <ul>
                            <li>NDIS participants & plan managers</li>
                            <li>Support coordinators & planners</li>
                            <li>Hospitals & aged care facilities</li>
                            <li>Families and carers</li>
                        </ul>
                    </Reveal>
                    <Reveal delay={120}>
                        <ContactForm title="Submit a referral" source="referral" />
                    </Reveal>
                </div>
            </section>
        </>
    );
}
