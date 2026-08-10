import Image from "next/image";
import BookWizard from "@/components/BookWizard";
import { SITE } from "@/lib/seedData";
import { PUBLIC_EMAIL } from "@/lib/emails";
import styles from "./page.module.css";

export const metadata = {
    title: "Book With Us | NDIS & Nursing Application",
    description:
        "Book with Chameleon Care Group. Complete our multi-step application for NDIS support, nursing care and assessments across Sutherland Shire, Illawarra, Central Coast and Sydney.",
    alternates: { canonical: "/book-with-us" },
    openGraph: {
        title: "Book With Us — Chameleon Care Group",
        description:
            "Start your application for personalised NDIS and nursing support.",
    },
};

export default function BookPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
                        Book with us
                    </span>
                    <h1>Start your care application</h1>
                    <p>
                        A guided multi-step form — about 5–7 minutes. Prefer to talk? Call{" "}
                        <a href={SITE.phoneHref} style={{ color: "#fff", fontWeight: 700 }}>
                            {SITE.phone}
                        </a>
                        .
                    </p>
                </div>
            </section>

            <section className={`section ${styles.section}`}>
                <div className="container">
                    <div className={styles.banner}>
                        <Image
                            src="/images/service-1.jpg"
                            alt="Inclusive NDIS personal care support"
                            width={1200}
                            height={320}
                            className={styles.bannerImg}
                            priority
                        />
                    </div>
                    <BookWizard />
                    <div className={styles.trust}>
                        <div>
                            <strong>Private & secure</strong>
                            <span>
                                Applications go to {PUBLIC_EMAIL}.
                            </span>
                        </div>
                        <div>
                            <strong>No obligation</strong>
                            <span>We&apos;ll discuss options before anything starts.</span>
                        </div>
                        <div>
                            <strong>Local team</strong>
                            <span>
                                Sutherland Shire · Illawarra · Central Coast · Sydney
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
