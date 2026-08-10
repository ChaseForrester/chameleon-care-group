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
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { NDIS_CHANNEL, NDIS_VIDEOS } from "@/lib/videos";
import {
  IconStar,
  IconGoogle,
  IconInstagram,
  IconFacebook,
  SocialLinks,
} from "@/components/SocialIcons";

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
            <div className={styles.heroBadges}>
              <span className={styles.pill}>NDIS support</span>
              <span className={styles.pill}>Aged care</span>
              <span className={styles.pill}>Private nursing</span>
            </div>
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
                Book with us
              </Link>
              <Link href="/services" className="btn btn-ghost btn-lg">
                Explore services
              </Link>
              <a href={SITE.phoneHref} className="btn btn-ghost btn-lg">
                Call {SITE.phone}
              </a>
            </div>
            <div className={styles.trustRow}>
              <span>
                <strong>24/7</strong> person-centred support
              </span>
              <span>
                <strong>AHPRA</strong> registered nurses
              </span>
              <span>
                <strong>ABN</strong> {SITE.abn}
              </span>
            </div>
            <div className={styles.heroSocial}>
              <span className={styles.heroSocialLabel}>Find us online</span>
              <SocialLinks
                className={styles.heroSocialLinks}
                iconClassName={styles.heroSocialIcon}
                size={18}
              />
            </div>
          </div>

          <div className={`${styles.heroVisual} animate-in delay-2`}>
            <div className={styles.heroPhoto}>
              <Image
                src="/images/service-1.jpg"
                alt="Participant receiving personalised NDIS support at home"
                fill
                priority
                sizes="(max-width: 900px) 90vw, 420px"
                quality={82}
                className={styles.heroPhotoImg}
              />
            </div>
            <div className={styles.floatCard}>
              <strong>Blending In. Standing Out.</strong>
              <span>
                Person-centred care tailored to your goals, routine and lifestyle.
              </span>
            </div>
            <div className={styles.floatLogo}>
              <Image
                src="/images/logo-nav.png"
                alt=""
                width={56}
                height={56}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.trustBar}>
          <div className={styles.trustLegal}>
            <span className={styles.trustKicker}>Registered business</span>
            <strong>Chameleon Care Group</strong>
            <a
              href={SITE.abnHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.abnLink}
            >
              ABN {SITE.abn}
            </a>
            <span className={styles.trustMeta}>
              Serving {SITE.region}
            </span>
          </div>
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

        <div className={styles.proofRow}>
          <a
            href={SITE.googleBusiness}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.proofCard}
          >
            <IconGoogle size={22} />
            <div>
              <strong>Google Business</strong>
              <span>View our profile &amp; map listing</span>
            </div>
          </a>
          <a
            href={SITE.googleReviews}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.proofCard} ${styles.proofReview}`}
          >
            <IconStar size={22} />
            <div>
              <strong>Google reviews</strong>
              <span>Share your experience with us</span>
            </div>
          </a>
          <a
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.proofCard}
          >
            <IconInstagram size={22} />
            <div>
              <strong>Instagram</strong>
              <span>@chameleon_care_group</span>
            </div>
          </a>
          <a
            href={SITE.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.proofCard}
          >
            <IconFacebook size={22} />
            <div>
              <strong>Facebook</strong>
              <span>Community updates &amp; care news</span>
            </div>
          </a>
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
            {services.map((s, idx) => (
              <Link
                key={s.id}
                href={`/services#${s.id}`}
                className={`card ${styles.serviceCard}`}
              >
                <div className={styles.serviceImg}>
                  <Image
                    src={s.image.endsWith(".webp") ? s.image.replace(".webp", ".jpg") : s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                    loading={idx < 2 ? "eager" : "lazy"}
                    quality={80}
                    className={styles.serviceImgEl}
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
                src="/images/care-meeting.jpg"
                alt="Support worker and participant planning care together"
                width={800}
                height={438}
                sizes="(max-width: 900px) 100vw, 50vw"
                loading="lazy"
                quality={70}
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

      <section className={`section section-muted ${styles.videoSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Learn about the NDIS</span>
            <h2>
              Videos from{" "}
              <span className="text-gradient">NDIS Australia</span>
            </h2>
            <p>
              Official explainers from the NDIS Australia YouTube channel —
              loaded only when you scroll near them (muted autoplay for
              browsers that allow it).
            </p>
          </div>
          <div className={styles.videoGrid}>
            {NDIS_VIDEOS.map((v, i) => (
              <div key={v.id} className={styles.videoCard}>
                <YouTubeEmbed
                  videoId={v.id}
                  title={v.title}
                  autoplay={i === 0}
                />
                <h3>{v.title}</h3>
                <p>{v.blurb}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <a
              href={NDIS_CHANNEL}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              More on @NDISAustralia
            </a>
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
          <div style={{ textAlign: "center", marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
            <Link href="/success-stories" className="btn btn-outline">
              More stories
            </Link>
            <a
              href={SITE.googleReviews}
              className={`btn btn-accent ${styles.reviewBtn}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconStar size={18} /> Leave a Google review
            </a>
            <a
              href={SITE.googleBusiness}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find us on Google
            </a>
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
