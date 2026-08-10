import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import FAQ from "@/components/FAQ";
import JsonLd, { faqJsonLd, orgJsonLd } from "@/components/JsonLd";
import {
  DEFAULT_OFFERS,
  DEFAULT_SERVICES,
  DEFAULT_STORIES,
  FAQ_ITEMS,
  SITE,
  WORKFORCE_POINTS,
} from "@/lib/seedData";
import { REGIONS, slugifySuburb } from "@/lib/locations";

export default function Home() {
  const services = DEFAULT_SERVICES.slice(0, 6);
  const stories = DEFAULT_STORIES;
  const offer = DEFAULT_OFFERS[0];
  const highlightSuburbs = [
    "Cronulla",
    "Miranda",
    "Caringbah",
    "Engadine",
    "Wollongong",
    "Gosford",
    "Hurstville",
    "Sylvania",
  ];

  return (
    <>
      <JsonLd data={orgJsonLd()} />
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />

      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={`${styles.heroCopy} animate-in`}>
            <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
              NDIS · Aged care · Private nursing
            </span>
            <h1>
              Care that adapts.
              <br />
              <span className="text-gradient">Support that stands out.</span>
            </h1>
            <p className="lead">
              Personalised NDIS, aged care and private nursing across{" "}
              {SITE.locations}. We blend into your lifestyle so your strengths
              can shine.
            </p>
            <div className={styles.heroActions}>
              <Link href="/book-with-us" className="btn btn-primary btn-lg">
                Book in now
              </Link>
              <Link href="/services" className="btn btn-ghost btn-lg">
                Explore services
              </Link>
            </div>
            <div className={styles.trustRow}>
              <span>
                <strong>24/7</strong> person-centred support
              </span>
              <span>
                <strong>AHPRA</strong> registered nurses
              </span>
              <span>
                <strong>Local</strong> Shire to Coast
              </span>
            </div>
          </div>

          <div className={`${styles.heroVisual} animate-in delay-2`}>
            <div className={styles.heroImageWrap}>
              <Image
                src="/images/logo-mark.png"
                alt="Chameleon Care Group logo"
                width={520}
                height={520}
                className={styles.heroImage}
                priority
              />
            </div>
            <div className={styles.floatCard}>
              <strong>Blending In. Standing Out.</strong>
              <span>
                Person-centred care tailored to your goals, routine and lifestyle.
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>24/7</strong>
            <span>Flexible care coverage</span>
          </div>
          <div className={styles.stat}>
            <strong>100+</strong>
            <span>Suburbs across NSW</span>
          </div>
          <div className={styles.stat}>
            <strong>NDIS</strong>
            <span>Framework aligned</span>
          </div>
          <div className={styles.stat}>
            <strong>Local</strong>
            <span>Shire · Illawarra · Coast</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">What we offer</span>
            <h2>
              Support that <span className="text-gradient">adapts with you</span>
            </h2>
            <p>
              From personal care and community access to complex nursing and
              clinical reporting — every service is tailored to you.
            </p>
          </div>

          <div className={styles.serviceGrid}>
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/services#${s.id}`}
                className={`card ${styles.serviceCard}`}
              >
                <div className={styles.serviceImg}>
                  <Image src={s.image} alt="" width={400} height={240} />
                </div>
                <div className={styles.serviceBody}>
                  <h3>{s.title}</h3>
                  <p>{s.short}</p>
                  <span className={styles.serviceLink}>Learn more →</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/services" className="btn btn-outline">
              View all services
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-warm">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Service areas</span>
            <h2>
              NDIS support <span className="text-gradient">near you</span>
            </h2>
            <p>
              In-home care across Sutherland Shire, Illawarra, Central Coast and
              Greater Sydney.
            </p>
          </div>
          <div className={styles.areaGrid}>
            {REGIONS.map((r) => (
              <Link
                key={r.id}
                href={`/locations/${r.id}`}
                className={`card ${styles.areaCard}`}
              >
                <h3>{r.name}</h3>
                <p>{r.blurb}</p>
                <span>{r.suburbs.length} suburbs →</span>
              </Link>
            ))}
          </div>
          <div className={styles.suburbRow}>
            {highlightSuburbs.map((s) => {
              const region = REGIONS.find((r) => r.suburbs.includes(s));
              if (!region) return null;
              return (
                <Link
                  key={s}
                  href={`/locations/${region.id}/${slugifySuburb(s)}`}
                  className={styles.suburbPill}
                >
                  {s}
                </Link>
              );
            })}
            <Link href="/locations" className={styles.suburbPillMore}>
              All areas
            </Link>
          </div>
        </div>
      </section>

      {offer && (
        <section className="section-tight">
          <div className="container">
            <div className={styles.offerStrip}>
              <div>
                <span className="badge badge-accent">{offer.badge}</span>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
              </div>
              <Link href={offer.ctaHref || "/book-with-us"} className="btn btn-accent">
                {offer.ctaLabel || "Get started"}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className={styles.aboutBand}>
            <div className={styles.aboutVisual}>
              <Image
                src="/images/nurse-hero.jpg"
                alt="Compassionate nursing support"
                width={800}
                height={438}
              />
            </div>
            <div className={styles.aboutCopy}>
              <span className="eyebrow">Why Chameleon Care Group</span>
              <h2>Empowering lives through tailored, inclusive care</h2>
              <p className="lead" style={{ marginTop: "1rem" }}>
                Reliable, high-quality care that adapts to your unique situation
                — compassionate, professional, and built around you.
              </p>
              <ul className={styles.checklist}>
                <li>
                  Inclusive, person-centred support that meets diverse needs 24/7
                </li>
                <li>Equality, reliability and exceptional clinical standards</li>
                <li>
                  Seamless care that helps every individual thrive in their
                  lifestyle
                </li>
              </ul>
              <Link href="/about-us" className="btn btn-secondary">
                About our team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Success stories</span>
            <h2>
              Real families. <span className="text-gradient">Real impact.</span>
            </h2>
          </div>
          <div className={styles.storyGrid}>
            {stories.map((s) => (
              <article key={s.id} className={`card ${styles.storyCard}`}>
                <div className={styles.quote}>
                  <p>{s.quote}</p>
                </div>
                <div className={styles.storyMeta}>
                  <strong>{s.name}</strong>
                  <span>{s.location}</span>
                </div>
              </article>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/success-stories" className="btn btn-outline">
              More stories
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
              Healthcare partners
            </span>
            <h2>Collaborating with all health sectors</h2>
          </div>
          <div className={styles.workGrid}>
            {WORKFORCE_POINTS.map((w) => (
              <div key={w.title} className={styles.workCard}>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.split}>
            <div>
              <span className="eyebrow">FAQ</span>
              <h2 style={{ marginBottom: "1.5rem" }}>
                Questions, answered clearly
              </h2>
              <FAQ />
            </div>
            <div className={styles.ctaPanel}>
              <span
                className="badge"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              >
                Get started
              </span>
              <h3>Ready for care that adapts to you?</h3>
              <p>
                Complete our guided application, book a meet-and-greet, or call
                our team today.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/book-with-us" className="btn btn-primary">
                  Book in now
                </Link>
                <Link href="/referral" className="btn btn-ghost">
                  Make a referral
                </Link>
                <a href={SITE.phoneHref} className="btn btn-ghost">
                  Call {SITE.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
