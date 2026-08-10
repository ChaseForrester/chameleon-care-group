import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/seedData";
import { PUBLIC_EMAIL } from "@/lib/emails";
import styles from "./page.module.css";
import Reveal from "@/components/Reveal";
import { SocialLinks } from "@/components/SocialIcons";

export const metadata = {
    title: "Contact Us",
    description:
        "Contact Chameleon Care Group — Sutherland Shire, Illawarra, Central Coast and Sydney. Email chameleonnursingcare@gmail.com or call 0430 068 300.",
    alternates: { canonical: "/contact-us" },
};

export default function ContactPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
                        Contact us
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
                    <Reveal className={styles.info}>
                        <div className={styles.photo}>
                            <Image
                                src="/images/nurse-hero.jpg"
                                alt="Inclusive NDIS nursing support in the home"
                                width={640}
                                height={360}
                            />
                        </div>
                        <h2>Get in touch</h2>
                        <div className={styles.cards}>
                            <a href={SITE.phoneHref} className={styles.infoCard}>
                                <strong>Phone</strong>
                                <span>{SITE.phone}</span>
                            </a>
                            <a href={`mailto:${PUBLIC_EMAIL}`} className={styles.infoCard}>
                                <strong>Email</strong>
                                <span>{PUBLIC_EMAIL}</span>
                            </a>
                            <div className={styles.infoCard}>
                                <strong>ABN</strong>
                                <a
                                    href={SITE.abnHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {SITE.abn}
                                </a>
                            </div>
                            <a
                                href={SITE.googleBusiness}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.infoCard}
                            >
                                <strong>Google Business</strong>
                                <span>View our profile &amp; map listing</span>
                            </a>
                            <a
                                href={SITE.googleReviews}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.infoCard}
                            >
                                <strong>Reviews</strong>
                                <span>Leave a Google review</span>
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
                        <div className={styles.socialBlock}>
                            <span>Follow &amp; review</span>
                            <SocialLinks
                                className={styles.socials}
                                iconClassName={styles.socialIcon}
                                size={20}
                            />
                        </div>
                    </Reveal>
                    <Reveal delay={120}>
                        <ContactForm title="Send an enquiry" source="contact-us" />
                    </Reveal>
                </div>
            </section>
        </>
    );
}
