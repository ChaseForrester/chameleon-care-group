import Link from "next/link";
import { notFound } from "next/navigation";
import {
    REGIONS,
    slugifySuburb,
    findSuburb,
    ALL_SUBURBS,
} from "@/lib/locations";
import { DEFAULT_SERVICES, FAQ_ITEMS, SITE } from "@/lib/seedData";
import JsonLd, { faqJsonLd, serviceJsonLd } from "@/components/JsonLd";
import styles from "../../page.module.css";

export function generateStaticParams() {
    return ALL_SUBURBS.map((s) => ({
        region: s.regionId,
        suburb: slugifySuburb(s.suburb),
    }));
}

export async function generateMetadata({ params }) {
    const { suburb: suburbSlug, region: regionId } = await params;
    const hit = findSuburb(suburbSlug);
    if (!hit || hit.regionId !== regionId) return { title: "Service area" };
    const name = hit.suburb;
    return {
        title: `NDIS Support & Nursing Care in ${name}`,
        description: `Chameleon Care Group provides personalised NDIS support, home nursing, respite and clinical care in ${name}, ${hit.region}, NSW. Book a meet-and-greet today.`,
        keywords: [
            `NDIS ${name}`,
            `home care ${name}`,
            `nursing care ${name}`,
            `disability support ${name}`,
            `aged care ${name}`,
            `continence assessment ${name}`,
        ],
        openGraph: {
            title: `NDIS & Nursing Care in ${name} | Chameleon Care Group`,
            description: `Person-centred NDIS and nursing support in ${name}, NSW.`,
        },
    };
}

export default async function SuburbPage({ params }) {
    const { suburb: suburbSlug, region: regionId } = await params;
    const hit = findSuburb(suburbSlug);
    if (!hit || hit.regionId !== regionId) notFound();

    const suburb = hit.suburb;
    const region = REGIONS.find((r) => r.id === regionId);
    const nearby = region.suburbs
        .filter((s) => s !== suburb)
        .slice(0, 12);

    const localFaqs = [
        {
            q: `Do you provide NDIS support in ${suburb}?`,
            a: `Yes. Chameleon Care Group delivers personalised NDIS support and nursing care in ${suburb} and across ${hit.region}. Services are provided in your home, tailored to your goals and plan.`,
        },
        {
            q: `What NDIS services are available in ${suburb}?`,
            a: `In ${suburb} we offer personal care, community access, respite and overnight care, medication management, complex nursing, continence assessments, clinical report writing and more.`,
        },
        {
            q: `How do I book care in ${suburb}?`,
            a: `Complete our online Book With Us form, call ${SITE.phone}, or email ${SITE.email}. We'll arrange a meet-and-greet for ${suburb} or nearby.`,
        },
        ...FAQ_ITEMS.slice(0, 3),
    ];

    return (
        <>
            <JsonLd data={serviceJsonLd("NDIS & Nursing Support", suburb)} />
            <JsonLd data={faqJsonLd(localFaqs)} />

            <section className="page-hero">
                <div className="container">
                    <nav className={styles.crumbs} aria-label="Breadcrumb">
                        <Link href="/locations">Areas</Link>
                        <span>/</span>
                        <Link href={`/locations/${regionId}`}>{hit.region}</Link>
                        <span>/</span>
                        <span>{suburb}</span>
                    </nav>
                    <h1>NDIS & nursing care in {suburb}</h1>
                    <p>
                        Personalised NDIS support, aged care and private nursing in{" "}
                        {suburb}, {hit.region}. Care that adapts to you — in the comfort of
                        your home.
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
                        <Link href="/book-with-us" className="btn btn-primary">
                            Book in {suburb}
                        </Link>
                        <a href={SITE.phoneHref} className="btn btn-ghost">
                            Call {SITE.phone}
                        </a>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className={styles.suburbGrid}>
                        <div>
                            <span className="eyebrow">Local care</span>
                            <h2>
                                Why families in {suburb} choose Chameleon Care Group
                            </h2>
                            <p className="lead" style={{ margin: "1rem 0 1.25rem" }}>
                                Whether you live in {suburb} or nearby, our team delivers
                                person-centred support that blends into your lifestyle — so your
                                strengths can stand out.
                            </p>
                            <ul className={styles.checks}>
                                <li>In-home visits across {suburb} and surrounding suburbs</li>
                                <li>NDIS-aligned support with AHPRA-registered nurses</li>
                                <li>Flexible scheduling including respite & overnight care</li>
                                <li>Clear clinical assessments and planner-ready reports</li>
                            </ul>
                        </div>
                        <div className={styles.sideCard}>
                            <h3>Serving {suburb}</h3>
                            <p>
                                Region: <strong>{hit.region}</strong>
                            </p>
                            <p>
                                Phone:{" "}
                                <a href={SITE.phoneHref}>{SITE.phone}</a>
                            </p>
                            <p>
                                Email:{" "}
                                <a href={SITE.emailHref}>{SITE.email}</a>
                            </p>
                            <Link href="/book-with-us" className="btn btn-accent btn-block" style={{ marginTop: "1rem" }}>
                                Start application
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section section-muted">
                <div className="container">
                    <h2 style={{ marginBottom: "1.25rem" }}>
                        Services available in {suburb}
                    </h2>
                    <div className={styles.serviceMini}>
                        {DEFAULT_SERVICES.map((s) => (
                            <Link
                                key={s.id}
                                href={`/services#${s.id}`}
                                className={`card ${styles.serviceMiniCard}`}
                            >
                                <h3>{s.title}</h3>
                                <p>{s.short}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: "1.25rem" }}>
                        Common questions about care in {suburb}
                    </h2>
                    <div className={styles.faqList}>
                        {localFaqs.map((f) => (
                            <details key={f.q} className={styles.faqItem}>
                                <summary>{f.q}</summary>
                                <p>{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {nearby.length > 0 && (
                <section className="section section-warm">
                    <div className="container">
                        <h2 style={{ marginBottom: "1rem" }}>Nearby suburbs</h2>
                        <div className={styles.suburbCloud}>
                            {nearby.map((s) => (
                                <Link
                                    key={s}
                                    href={`/locations/${regionId}/${slugifySuburb(s)}`}
                                    className={styles.chip}
                                >
                                    {s}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
