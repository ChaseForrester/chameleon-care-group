import Link from "next/link";
import styles from "./page.module.css";
import { StoriesGrid } from "@/components/DynamicContent";

export const metadata = {
  title: "Success Stories",
  description:
    "Participant and family success stories from Chameleon Care Group — shared with consent.",
};

export default function SuccessStoriesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
            Success stories
          </span>
          <h1>Stories of care that made a difference</h1>
          <p>
            Shared with consent. Real experiences from families across
            Sutherland Shire, Central Coast and beyond.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <StoriesGrid styles={styles} />

          <div className={styles.note}>
            <p>
              Want to share your experience? We only publish stories with clear
              consent and can anonymise details where preferred.
            </p>
            <Link href="/contact-us" className="btn btn-outline">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
