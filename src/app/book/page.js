import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/seedData";
import styles from "./page.module.css";

export const metadata = {
    title: "Book With Us",
    description:
        "Schedule an appointment or meet-and-greet with Chameleon Care Group.",
};

export default function BookPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
                        Book with us
                    </span>
                    <h1>Schedule your appointment</h1>
                    <p>
                        Book a meet-and-greet, assessment or support consultation. Prefer to
                        call? We&apos;re on {SITE.phone}.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className={`container ${styles.wrap}`}>
                    <div className={styles.side}>
                        <h2>What happens next?</h2>
                        <ol className={styles.steps}>
                            <li>
                                <strong>Tell us what you need</strong>
                                <span>Share a little about goals, timing and location.</span>
                            </li>
                            <li>
                                <strong>We get in touch</strong>
                                <span>Our team will confirm availability and next steps.</span>
                            </li>
                            <li>
                                <strong>Meet your care team</strong>
                                <span>Start with a conversation that puts you first.</span>
                            </li>
                        </ol>
                    </div>
                    <ContactForm title="Request a booking" source="book" />
                </div>
            </section>
        </>
    );
}
