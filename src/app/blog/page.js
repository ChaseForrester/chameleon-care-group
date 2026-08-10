import styles from "./page.module.css";
import { BlogGrid } from "@/components/DynamicContent";

export const metadata = {
  title: "Blog",
  description:
    "Insights on NDIS support, clinical care and living well with Chameleon Care Group.",
  openGraph: {
    title: "Blog | Chameleon Care Group",
    description:
      "Insights on NDIS support, clinical care and living well with Chameleon Care Group.",
    type: "website",
    images: [
      {
        url: "/images/about-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Chameleon Care Group blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Chameleon Care Group",
    description:
      "Insights on NDIS support, clinical care and living well with Chameleon Care Group.",
    images: ["/images/about-hero.jpg"],
  },
};

export default function BlogPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--color-brand-green)" }}>
            Blog
          </span>
          <h1>Insights & updates</h1>
          <p>
            Practical guides, clinical tips and news from the Chameleon Care
            Group team.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <BlogGrid styles={styles} />
        </div>
      </section>
    </>
  );
}
