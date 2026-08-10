import Link from "next/link";
import { notFound } from "next/navigation";
import { REGIONS, slugifySuburb } from "@/lib/locations";
import styles from "../page.module.css";
import JsonLd, { serviceJsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
    return REGIONS.map((r) => ({ region: r.id }));
}

export async function generateMetadata({ params }) {
    const { region: regionId } = await params;
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return { title: "Service area" };
    return {
        title: `NDIS & Nursing Care in ${region.name}`,
        description: `Personalised NDIS support, home nursing and aged care across ${region.name}, NSW — including ${region.suburbs.slice(0, 8).join(", ")} and more.`,
        keywords: region.suburbs.map((s) => `NDIS ${s}`),
    };
}

export default async function RegionPage({ params }) {
    const { region: regionId } = await params;
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) notFound();

    return (
        <>
            <JsonLd
                data={serviceJsonLd("NDIS & Nursing Support", region.name)}
            />
            <section className="page-hero">
                <div className="container">
                    <Link
                        href="/locations"
                        style={{ color: "var(--color-gold)", fontWeight: 600 }}
                    >
                        ← All areas
                    </Link>
                    <h1 style={{ marginTop: "0.75rem" }}>
                        Care in {region.name}
                    </h1>
                    <p>{region.blurb}</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2 className={styles.listTitle}>Suburbs we serve</h2>
                    <div className={styles.suburbCloud}>
                        {region.suburbs.map((suburb) => (
                            <Link
                                key={suburb}
                                href={`/locations/${region.id}/${slugifySuburb(suburb)}`}
                                className={styles.chip}
                            >
                                {suburb}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.aeo} style={{ marginTop: "2.5rem" }}>
                        <h2>NDIS support in {region.name}</h2>
                        <p>
                            Looking for an NDIS provider in {region.name}? Chameleon Care
                            Group offers personal care, community access, respite, complex
                            nursing, continence assessments and clinical reporting — delivered
                            in your home across {region.suburbs.length}+ local suburbs.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                            <Link href="/book-with-us" className="btn btn-primary">
                                Book in {region.name}
                            </Link>
                            <Link href="/services" className="btn btn-outline">
                                View services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
