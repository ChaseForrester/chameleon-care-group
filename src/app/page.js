import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import FAQ from "@/components/FAQ";
import JsonLd, { faqJsonLd, orgJsonLd } from "@/components/JsonLd";
import {
  DEFAULT_SERVICES,
  DEFAULT_STORIES,
  FAQ_ITEMS,
  SITE,
} from "@/lib/seedData";
import { REGIONS, slugifySuburb } from "@/lib/locations";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { NDIS_CHANNEL, NDIS_VIDEOS } from "@/lib/videos";
import {
  IconStar,
  IconGoogle,
  IconInstagram,
  IconFacebook,
} from "@/components/SocialIcons";

export default function Home() {
  const services = DEFAULT_SERVICES.slice(0, 3);
  const moreServices = DEFAULT_SERVICES.slice(3);
  const stories = DEFAULT_STORIES.slice(0, 3);
  const suburbs = [
    "Cronulla",
    "Miranda",
    "Caringbah",
    "Wollongong",
    "Gosford",
    "Hurstville",
  ];

  return (
    <>
      <JsonLd data={orgJsonLd()} />
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image
            src="/images/nurse-hero.jpg"
            alt="Professional NDIS and nursing care in the home"
            fill
            priority
            quality={85}
            sizes="100vw"
            className={styles.heroBg}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <p className={styles.kicker}>
              Chameleon Care Group · ABN {SITE.abn}
            </p>
            <h1>
              Exceptional care,
              <br />
              personalised to you
            </h1>
            <p className={styles.heroLead}>
              NDIS support, aged care and private nursing across the Sutherland
              Shire, Illawarra, Central Coast and Greater Sydney — delivered
              with clinical excellence and genuine compassion.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/book-with-us" className={styles.btnPrimary}>
                Book a consultation
              </Link>
              <Link href="/services" className={styles.btnSecondary}>
                View our services
              </Link>
            </div>
            <dl className={styles.heroMeta}>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={SITE.phoneHref}>{SITE.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={SITE.emailHref}>{SITE.email}</a>
                </dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{SITE.locations}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className={styles.trustStrip} aria-label="Credentials">
        <div className={`container ${styles.trustInner}`}>
          <div className={styles.trustItem}>
            <span className={styles.trustLabel}>Registered business</span>
            <a
              href={SITE.abnHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.trustValue}
            >
              ABN {SITE.abn}
            </a>
          </div>
          <div className={styles.trustDivider} aria-hidden />
          <div className={styles.trustItem}>
            <span className={styles.trustLabel}>Clinical standard</span>
            <span className={styles.trustValue}>AHPRA-registered nurses</span>
          </div>
          <div className={styles.trustDivider} aria-hidden />
          <div className={styles.trustItem}>
            <span className={styles.trustLabel}>Support model</span>
            <span className={styles.trustValue}>Person-centred · 24/7 capable</span>
          </div>
          <div className={styles.trustDivider} aria-hidden />
          <div className={styles.trustSocial}>
            <a
              href={SITE.googleBusiness}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Business Profile"
              title="Google Business"
            >
              <IconGoogle size={18} />
            </a>
            <a
              href={SITE.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Leave a Google review"
              title="Leave a review"
            >
              <IconStar size={18} />
            </a>
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <IconInstagram size={18} />
            </a>
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <IconFacebook size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className={styles.section}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Our services</p>
            <h2>Support designed around your life</h2>
            <p>
              From everyday assistance to complex clinical care — every package
              is tailored to your goals, plan and preferences.
            </p>
          </header>

          <div className={styles.serviceFeatured}>
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/services#${s.id}`}
                className={styles.serviceCard}
              >
                <div className={styles.serviceImg}>
                  <Image
                    src={s.image.replace(/\.webp$/, ".jpg")}
                    alt={s.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    quality={80}
                  />
                </div>
                <div className={styles.serviceBody}>
                  <h3>{s.title}</h3>
                  <p>{s.short}</p>
                  <span className={styles.serviceCta}>Learn more</span>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.serviceList}>
            {moreServices.map((s) => (
              <Link
                key={s.id}
                href={`/services#${s.id}`}
                className={styles.serviceRow}
              >
                <span className={styles.serviceRowTitle}>{s.title}</span>
                <span className={styles.serviceRowDesc}>{s.short}</span>
                <span className={styles.serviceRowArrow} aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>

          <div className={styles.centerCta}>
            <Link href="/services" className={styles.btnOutline}>
              View all services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className={styles.whySection}>
        <div className={`container ${styles.whyGrid}`}>
          <div className={styles.whyCopy}>
            <p className={styles.sectionEyebrow}>Why families choose us</p>
            <h2>Clinical excellence with a human touch</h2>
            <p>
              We combine AHPRA-registered nursing expertise with flexible,
              person-centred support — so participants and families feel safe,
              respected and in control.
            </p>
            <ul className={styles.whyList}>
              <li>Individualised care plans that evolve with your goals</li>
              <li>Experienced carers and nurses you can trust</li>
              <li>Clear communication with families and coordinators</li>
              <li>Coverage across {SITE.locations}</li>
            </ul>
            <div className={styles.whyActions}>
              <Link href="/about-us" className={styles.btnPrimaryDark}>
                About our team
              </Link>
              <Link href="/book-with-us" className={styles.btnOutline}>
                Book a consultation
              </Link>
            </div>
          </div>
          <div className={styles.whyVisual}>
            <Image
              src="/images/care-meeting.jpg"
              alt="Care team planning support with a participant"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              quality={80}
              className={styles.whyImg}
            />
          </div>
        </div>
      </section>

      {/* ── Areas ── */}
      <section className={styles.sectionMuted}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Service areas</p>
            <h2>Care close to home</h2>
            <p>
              In-home support across four major NSW regions — and growing with
              community need.
            </p>
          </header>
          <div className={styles.regionGrid}>
            {REGIONS.map((r) => (
              <Link
                key={r.id}
                href={`/locations/${r.id}`}
                className={styles.regionCard}
              >
                <h3>{r.name}</h3>
                <p>{r.blurb}</p>
                <span>{r.suburbs.length}+ suburbs</span>
              </Link>
            ))}
          </div>
          <div className={styles.suburbRow}>
            {suburbs.map((s) => {
              const region = REGIONS.find((r) => r.suburbs.includes(s));
              if (!region) return null;
              return (
                <Link
                  key={s}
                  href={`/locations/${region.id}/${slugifySuburb(s)}`}
                  className={styles.suburbChip}
                >
                  {s}
                </Link>
              );
            })}
            <Link href="/locations" className={styles.suburbChipAll}>
              All areas
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stories ── */}
      <section className={styles.section}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Testimonials</p>
            <h2>Trusted by families across NSW</h2>
          </header>
          <div className={styles.storyGrid}>
            {stories.map((s) => (
              <blockquote key={s.id} className={styles.storyCard}>
                <p>&ldquo;{s.quote}&rdquo;</p>
                <footer>
                  <strong>{s.name}</strong>
                  <span>{s.location}</span>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className={styles.centerCta}>
            <Link href="/success-stories" className={styles.btnOutline}>
              More stories
            </Link>
            <a
              href={SITE.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimaryDark}
            >
              <IconStar size={16} /> Leave a Google review
            </a>
          </div>
        </div>
      </section>

      {/* ── NDIS videos (compact) ── */}
      <section className={styles.sectionMuted}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>From NDIS Australia</p>
            <h2>Understand the NDIS</h2>
            <p>
              Official resources from the NDIS Australia channel — helpful for
              participants and families starting their journey.
            </p>
          </header>
          <div className={styles.videoGrid}>
            {NDIS_VIDEOS.slice(0, 2).map((v) => (
              <div key={v.id} className={styles.videoCard}>
                <YouTubeEmbed videoId={v.id} title={v.title} autoplay={false} />
                <h3>{v.title}</h3>
              </div>
            ))}
          </div>
          <div className={styles.centerCta}>
            <a
              href={NDIS_CHANNEL}
              className={styles.btnOutline}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch more on YouTube
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ + CTA ── */}
      <section className={styles.section}>
        <div className={`container ${styles.faqGrid}`}>
          <div>
            <p className={styles.sectionEyebrow}>FAQ</p>
            <h2 className={styles.faqTitle}>Common questions</h2>
            <FAQ items={FAQ_ITEMS.slice(0, 5)} />
          </div>
          <aside className={styles.ctaCard}>
            <p className={styles.ctaKicker}>Next step</p>
            <h2>Ready to talk about your care?</h2>
            <p>
              Book a consultation, make a referral, or call our team — we&apos;re
              here to help you take the next step with confidence.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/book-with-us" className={styles.btnPrimary}>
                Book with us
              </Link>
              <Link href="/referral" className={styles.btnGhost}>
                Make a referral
              </Link>
              <a href={SITE.phoneHref} className={styles.btnGhost}>
                Call {SITE.phone}
              </a>
            </div>
            <p className={styles.ctaLegal}>
              ABN {SITE.abn} ·{" "}
              <a href={SITE.emailHref}>{SITE.email}</a>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
