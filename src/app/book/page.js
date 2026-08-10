import BookWizard from "@/components/BookWizard";
import { SITE } from "@/lib/seedData";
import styles from "./page.module.css";

export const metadata = {
    title: "Book In | NDIS & Nursing Application",
    description:
        "Book with Chameleon Care Group. Complete our multi-step application for NDIS support, nursing care and assessments across Sutherland Shire, Illawarra, Central Coast and Sydney.",
    openGraph: {
        title: "Book In — Chameleon Care Group",
        description:
            "Start your application for personalised NDIS and nursing support.",
    },
};

export default function BookPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span
                        className="eyebrow"
                        style={{ color: "var(--color-gold)" }}
                    >
                        Book with us
                    </span>
                    <h1>Start your care application</h1>
                    <p>
                        A guided multi-step form — about 5 minutes. Prefer to talk? Call{" "}
                        <a href={SITE.phoneHref} style={{ color: "#fff", fontWeight: 700 }}>
                            {SITE.phone}
                        </a>
                        .
                    </p>
                </div>
            </section>

            <section className={`section ${styles.section}`}>
                <div className="container">
                    <BookWizard />
                    <div className={styles.trust}>
                        <div>
                            <strong>Private & secure</strong>
                            <span>Your details go to our care team only.</span>
                        </div>
                        <div>
                            <strong>No obligation</strong>
                            <span>We&apos;ll discuss options before anything starts.</span>
                        </div>
                        <div>
                            <strong>Local team</strong>
                            <span>Sutherland Shire · Illawarra · Central Coast · Sydney</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
