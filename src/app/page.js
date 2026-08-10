import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import FAQ from "@/components/FAQ";
import {
  DEFAULT_OFFERS,
  DEFAULT_SERVICES,
  DEFAULT_STORIES,
  SITE,
  WORKFORCE_POINTS,
} from "@/lib/seedData";

export default function Home() {
  const services = DEFAULT_SERVICES.slice(0, 6);
  const stories = DEFAULT_STORIES;
  const offer = DEFAULT_OFFERS[0];

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={`${styles.heroCopy} animate-in`}>
            <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
              NDIS · Aged care · Private nursing
            </span>
            <h1>
              Providing support.
              <br />
              <span className="text-gradient">Care that adapts to you.</span>
            </h1>
            <p className="lead">
              Chameleon Care Group delivers personalised NDIS, aged care and
              private nursing across {SITE.locations}. We blend into your
              lifestyle — so your strengths can stand out.
            </p>
            <div className={styles.heroActions}>
              <Link href="/book" className="btn btn-primary btn-lg">
                Book with us
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
                <strong>NDIS</strong> ready assessments
              </span>
            </div>
          </div>

          <div className={`${styles.heroVisual} animate-in delay-2`}>
            <div className={styles.heroImageWrap}>
              <Image
                src="/images/chameleon.png"
                alt="Chameleon Care Group illustration"
                width={632}
                height={632}
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
            <strong>3+</strong>
            <span>Regions across NSW</span>
          </div>
          <div className={styles.stat}>
            <strong>NDIS</strong>
            <span>Framework aligned</span>
          </div>
          <div className={styles.stat}>
            <strong>100%</strong>
            <span>Person-centred approach</span>
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
              clinical reporting — every service is tailored to individual needs,
              goals and lifestyles.
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
                  <Image
                    src={s.image}
                    alt=""
                    width={400}
                    height={240}
                  />
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

      {offer && (
        <section className="section-tight">
          <div className="container">
            <div className={styles.offerStrip}>
              <div>
                <span className="badge badge-accent">{offer.badge}</span>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
              </div>
              <Link href={offer.ctaHref || "/book"} className="btn btn-primary">
                {offer.ctaLabel || "Get started"}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section section-muted">
        <div className="container">
          <div className={styles.aboutBand}>
            <div className={styles.aboutVisual}>
              <Image
                src="/images/nurse-hero.png"
                alt="Compassionate nursing support"
                width={800}
                height={438}
              />
            </div>
            <div className={styles.aboutCopy}>
              <span className="eyebrow">Why Chameleon Care Group</span>
              <h2>
                Empowering lives through tailored, inclusive care
              </h2>
              <p className="lead" style={{ marginTop: "1rem" }}>
                By choosing CCG, you gain reliable, high-quality care that adapts
                to your unique situation — compassionate, professional, and built
                around you.
              </p>
              <ul className={styles.checklist}>
                <li>
                  Inclusive, person-centred support that meets diverse needs 24/7
                </li>
                <li>
                  Equality, reliability and exceptional clinical standards
                </li>
                <li>
                  Seamless care that helps every individual thrive in their lifestyle
                </li>
              </ul>
              <Link href="/about" className="btn btn-secondary">
                About our team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Success stories</span>
            <h2>
              Real families. <span className="text-gradient">Real impact.</span>
            </h2>
            <p>
              Shared with consent — hear how our carers and nurses make a
              difference across the Shire and beyond.
            </p>
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
            <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
              Healthcare partners
            </span>
            <h2>Collaborating with all health sectors</h2>
            <p>
              Flexible contract nursing and workforce solutions for hospitals,
              aged care facilities, and private providers.
            </p>
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
              <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                Get started
              </span>
              <h3>Ready for care that adapts to you?</h3>
              <p>
                Fill out a quick enquiry, book a meet-and-greet, or call our
                Sutherland Shire team today.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/book" className="btn btn-primary">
                  Schedule appointment
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
