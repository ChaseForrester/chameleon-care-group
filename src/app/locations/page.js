import Link from "next/link";
import { REGIONS, slugifySuburb } from "@/lib/locations";
import styles from "./page.module.css";
import JsonLd, { orgJsonLd } from "@/components/JsonLd";

export const metadata = {
    title: "Service Areas | NDIS Support Near You",
    description:
        "Chameleon Care Group provides NDIS, nursing and aged care across Sutherland Shire, Illawarra, Central Coast and Greater Sydney — including Cronulla, Miranda, Wollongong, Gosford and more.",
    keywords: [
        "NDIS Sutherland Shire",
        "NDIS Cronulla",
        "home care Miranda",
        "nursing care Wollongong",
        "NDIS Gosford",
        "disability support Sydney",
    ],
};

export default function LocationsPage() {
    return (
        <>
            <JsonLd data={orgJsonLd()} />
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
                        Where we work
                    </span>
                    <h1>NDIS & nursing support near you</h1>
                    <p>
                        Find personalised care in your suburb. We deliver in-home support
                        across four major NSW regions.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className={styles.regions}>
                        {REGIONS.map((region) => (
                            <article key={region.id} className={`card ${styles.region}`}>
                                <div className={styles.regionHead}>
                                    <h2>{region.name}</h2>
                                    <p>{region.blurb}</p>
                                    <Link
                                        href={`/locations/${region.id}`}
                                        className="btn btn-outline btn-sm"
                                    >
                                        View region
                                    </Link>
                                </div>
                                <div className={styles.suburbCloud}>
                                    {region.suburbs.slice(0, 18).map((suburb) => (
                                        <Link
                                            key={suburb}
                                            href={`/locations/${region.id}/${slugifySuburb(suburb)}`}
                                            className={styles.chip}
                                        >
                                            {suburb}
                                        </Link>
                                    ))}
                                    {region.suburbs.length > 18 && (
                                        <Link
                                            href={`/locations/${region.id}`}
                                            className={styles.more}
                                        >
                                            +{region.suburbs.length - 18} more
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className={styles.aeo}>
                        <h2>Looking for NDIS support in your suburb?</h2>
                        <p>
                            People often ask: <em>“Who provides NDIS home care near me?”</em>{" "}
                            and <em>“Which provider covers Cronulla, Miranda or Gosford?”</em>
                            . Chameleon Care Group delivers person-centred NDIS support,
                            nursing and aged care across the suburbs listed above — in your
                            home, on your schedule.
                        </p>
                        <Link href="/book" className="btn btn-primary">
                            Book support in your area
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
