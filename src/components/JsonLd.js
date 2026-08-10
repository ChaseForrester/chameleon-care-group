export default function JsonLd({ data }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function orgJsonLd() {
    const base = "https://www.chameleoncaregroup.com.au";
    return {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "@id": `${base}/#organization`,
        name: "Chameleon Care Group",
        alternateName: "CCG",
        url: base,
        logo: `${base}/images/logo-mark.png`,
        image: `${base}/images/logo-mark.png`,
        telephone: "+61430068300",
        email: "chameleonnursingcare@gmail.com",
        description:
            "Personalised NDIS, aged care and private nursing support across Sutherland Shire, Illawarra, Central Coast and Greater Sydney.",
        areaServed: [
            { "@type": "AdministrativeArea", name: "Sutherland Shire" },
            { "@type": "AdministrativeArea", name: "Illawarra" },
            { "@type": "AdministrativeArea", name: "Central Coast NSW" },
            { "@type": "AdministrativeArea", name: "Greater Sydney" },
        ],
        address: {
            "@type": "PostalAddress",
            addressLocality: "Sutherland",
            addressRegion: "NSW",
            addressCountry: "AU",
        },
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "09:00",
                closes: "17:00",
            },
        ],
        sameAs: [
            "https://www.facebook.com/chameleoncaregroup/",
            "https://www.instagram.com/chameleon_care_group/",
        ],
        priceRange: "$$",
    };
}

export function faqJsonLd(items) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
            },
        })),
    };
}

export function serviceJsonLd(service, suburb) {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: suburb
            ? `${service} in ${suburb}`
            : service,
        provider: {
            "@type": "Organization",
            name: "Chameleon Care Group",
        },
        areaServed: suburb
            ? { "@type": "Place", name: `${suburb}, NSW, Australia` }
            : "NSW, Australia",
    };
}
