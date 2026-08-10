import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { SITE } from "@/lib/seedData";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "About Us | Inclusive NDIS Support",
  description:
    "Learn about Chameleon Care Group — personalised NDIS, aged care and private nursing across Sutherland Shire, Illawarra, Central Coast and Sydney.",
  alternates: { canonical: "/about-us" },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
            About us
          </span>
          <h1>Blending in. Standing out.</h1>
          <p>
            Dedication to improving lives with individual-focused and
            community-oriented services for people with disability across NSW.
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.grid}`}>
          <Reveal>
            <span className="eyebrow">Who we are</span>
            <h2>Care that adapts as life does</h2>
            <p className="lead" style={{ margin: "1rem 0 1.25rem" }}>
              Chameleon Care Group provides personalised NDIS, aged care and
              private nursing support to empower participants of all abilities —
              including people with Down syndrome, physical disability, complex
              care needs and developmental difference.
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
          </Reveal>
          <Reveal delay={120} className={styles.imageCard}>
            <Image
              src="/images/about-hero.webp"
              alt="Participant with Down syndrome enjoying outdoor activities with support worker"
              width={640}
              height={520}
              className={styles.coverImg}
              priority
            />
          </Reveal>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <Reveal className={styles.valuesHead}>
            <span className="eyebrow">How we work</span>
            <h2>Person-centred. Clinical. Community-focused.</h2>
          </Reveal>
          <div className={styles.values}>
            <Reveal as="article" className="card" delay={0}>
              <h3>Person-centred plans</h3>
              <p>
                Individualised care plans that adapt as needs change — always
                built around goals, preferences and lifestyle.
              </p>
            </Reveal>
            <Reveal as="article" className="card" delay={100}>
              <h3>Clinical excellence</h3>
              <p>
                AHPRA-registered nurses, up-to-date training and professional
                insurance. Complex assessments and reports you can trust.
              </p>
            </Reveal>
            <Reveal as="article" className="card" delay={200}>
              <h3>Inclusive by design</h3>
              <p>
                We celebrate every ability and foster equality so participants,
                families and support networks can thrive together.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.gallery}`}>
          <Reveal>
            <Image
              src="/images/community-cafe.webp"
              alt="Participant with Down syndrome on community access outing"
              width={600}
              height={400}
            />
          </Reveal>
          <Reveal delay={100}>
            <Image
              src="/images/service-complex.webp"
              alt="Participant with mobility support practising independence skills"
              width={600}
              height={400}
            />
          </Reveal>
          <Reveal delay={200}>
            <Image
              src="/images/care-family.webp"
              alt="Family and support team meeting about NDIS goals"
              width={600}
              height={400}
            />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.cta}`}>
          <div>
            <h2>Let&apos;s talk about your goals</h2>
            <p>
              Whether you need everyday support or complex clinical care,
              we&apos;re here to help.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/book-with-us" className="btn btn-primary">
              Book with us
            </Link>
            <Link href="/contact-us" className="btn btn-outline">
              Contact the team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
