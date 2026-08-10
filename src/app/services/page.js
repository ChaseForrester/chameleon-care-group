import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { DEFAULT_SERVICES } from "@/lib/seedData";

export const metadata = {
  title: "Services",
  description:
    "NDIS support, personal care, community access, respite, complex nursing, continence assessments and clinical reporting.",
  alternates: { canonical: "/services" },
};

/** Map any stale CMS path (.png/.webp missing) to a known-good JPEG */
const SAFE_IMAGES = {
  "personal-care": "/images/service-1.jpg",
  "community-access": "/images/service-2.jpg",
  "respite-overnight": "/images/service-3.jpg",
  "complex-nursing": "/images/nurse-hero.jpg",
  "continence-assessments": "/images/nurse-clinical.jpg",
  "clinical-reporting": "/images/clinical-report.jpg",
};

function resolveImage(service) {
  if (SAFE_IMAGES[service.id]) return SAFE_IMAGES[service.id];
  const img = service.image || "";
  // Prefer jpg equivalents when webp path given
  if (img.endsWith(".webp")) return img.replace(/\.webp$/, ".jpg");
  if (img.startsWith("/images/")) return img;
  return "/images/service-1.jpg";
}

export default function ServicesPage() {
  const services = DEFAULT_SERVICES.map((s) => ({
    ...s,
    image: resolveImage(s),
  }));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span
            className="eyebrow"
            style={{ color: "var(--color-gold)" }}
          >
            Our services
          </span>
          <h1>Support designed around your life</h1>
          <p>
            Personal care, community access, respite, overnight care, medication
            management, behavioural support, paediatric disability care, clinical
            assessments — and more.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.list}>
            {services.map((s, i) => (
              <article
                key={s.id}
                id={s.id}
                className={`${styles.item} ${i % 2 === 1 ? styles.reverse : ""}`}
              >
                <div className={styles.media}>
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 48vw"
                    className={styles.mediaImg}
                    quality={80}
                    priority={i === 0}
                  />
                </div>
                <div className={styles.content}>
                  <span className="badge">Service</span>
                  <h2>{s.title}</h2>
                  <p>{s.description}</p>
                  <ul>
                    {(s.features || []).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link href="/book-with-us" className="btn btn-primary">
                    Enquire about this service
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className={`container ${styles.bottomCta}`}>
          <div>
            <h2>Not sure which service you need?</h2>
            <p>
              Tell us about your goals — we&apos;ll help map the right supports
              to your NDIS plan or private care needs.
            </p>
          </div>
          <Link href="/contact-us" className="btn btn-secondary">
            Talk to our team
          </Link>
        </div>
      </section>
    </>
  );
}
