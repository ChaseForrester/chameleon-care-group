import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { SITE } from "@/lib/seedData";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Chameleon Care Group — personalised NDIS, aged care and private nursing across Sutherland Shire, Illawarra, Central Coast and Sydney.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
            About us
          </span>
          <h1>Blending in. Standing out.</h1>
          <p>
            Dedication to improving lives with individual-focused and
            community-oriented services.
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.grid}`}>
          <div>
            <span className="eyebrow">Who we are</span>
            <h2>Care that adapts as life does</h2>
            <p className="lead" style={{ margin: "1rem 0 1.25rem" }}>
              Chameleon Care Group provides personalised NDIS, aged care and
              private nursing support to empower you and achieve your goals.
            </p>
            <p>
              Our dedicated team delivers 24/7 services while embracing
              inclusivity, diversity and equality across clients, staff and
              nurses. We aim to make care seamless, supportive and empowering —
              so everyone has the opportunity to thrive.
            </p>
            <p style={{ marginTop: "1rem" }}>
              Based in the {SITE.region}, we also support participants across{" "}
              {SITE.locations}.
            </p>
          </div>
          <div className={styles.imageCard}>
            <Image
              src="/images/care-meeting.jpg"
              alt="Chameleon Care Group brand illustration"
              width={520}
              height={520}
            />
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className={styles.valuesHead}>
            <span className="eyebrow">How we work</span>
            <h2>Person-centred. Clinical. Community-focused.</h2>
          </div>
          <div className={styles.values}>
            <article className="card">
              <h3>Person-centred plans</h3>
              <p>
                Individualised care plans that adapt as your needs change —
                always built around your goals, preferences and lifestyle.
              </p>
            </article>
            <article className="card">
              <h3>Clinical excellence</h3>
              <p>
                AHPRA-registered nurses, up-to-date training and professional
                insurance. Complex assessments and reports you can trust.
              </p>
            </article>
            <article className="card">
              <h3>Inclusive by design</h3>
              <p>
                We foster equality and reliability so every individual can
                thrive — participants, families and support networks alike.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.cta}`}>
          <div>
            <h2>Let&apos;s talk about your goals</h2>
            <p>
              Whether you need everyday support or complex clinical care, we&apos;re
              here to help.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/book" className="btn btn-primary">
              Book with us
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Contact the team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
