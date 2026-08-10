import Link from "next/link";
import styles from "./page.module.css";
import { ServicesList } from "@/components/DynamicContent";

export const metadata = {
  title: "Services",
  description:
    "NDIS support, personal care, community access, respite, complex nursing, continence assessments and clinical reporting.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
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
          <ServicesList styles={styles} />
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
