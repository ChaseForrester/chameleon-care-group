import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/seedData";
import styles from "./page.module.css";

export const metadata = {
    title: "Contact",
    description:
        "Contact Chameleon Care Group — Sutherland Shire, Illawarra, Central Coast and Sydney.",
};

export default function ContactPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
                        Contact
                    </span>
                    <h1>We&apos;re here to help</h1>
                    <p>
                        Fill out the form or reach us directly — we&apos;ll respond as soon
                        as we can.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className={`container ${styles.grid}`}>
                    <div className={styles.info}>
                        <h2>Get in touch</h2>
                        <div className={styles.cards}>
                            <a href={SITE.phoneHref} className={styles.infoCard}>
                                <strong>Phone</strong>
                                <span>{SITE.phone}</span>
                            </a>
                            <a href={SITE.emailHref} className={styles.infoCard}>
                                <strong>Email</strong>
                                <span>{SITE.email}</span>
                            </a>
                            <div className={styles.infoCard}>
                                <strong>Locations</strong>
                                <span>{SITE.locations}</span>
                            </div>
                            <div className={styles.infoCard}>
                                <strong>Hours</strong>
                                <span>Mon–Fri 9:00am – 5:00pm</span>
                                <span className={styles.sub}>{SITE.afterHours}</span>
                            </div>
                        </div>
                    </div>
                    <ContactForm title="Send an enquiry" source="contact" />
                </div>
            </section>
        </>
    );
}
