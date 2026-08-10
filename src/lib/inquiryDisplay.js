import { sourceLabel } from "@/lib/emails";

/** Normalize documents array from an inquiry payload. */
export function getInquiryDocuments(item = {}) {
    const docs = item.documents;
    if (Array.isArray(docs) && docs.length) {
        return docs
            .filter((d) => d && (d.url || d.name))
            .map((d) => ({
                name: d.name || "Document",
                url: d.url || "",
                size: d.size || 0,
                contentType: d.contentType || "",
            }));
    }
    return [];
}

export function formatFileSize(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatInquiryDate(value) {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

export function inquiryDisplayName(item = {}) {
    return (
        item.name ||
        [item.firstName, item.lastName].filter(Boolean).join(" ") ||
        "Unknown"
    );
}

export function inquirySourceBadge(source) {
    return sourceLabel(source);
}

/**
 * Structured field groups for admin detail view.
 * Skips empty values so the UI stays clean.
 */
export function getInquirySections(item = {}) {
    const val = (v) => {
        if (v === undefined || v === null || v === "") return null;
        if (typeof v === "boolean") return v ? "Yes" : "No";
        return String(v);
    };

    const section = (title, pairs) => {
        const fields = pairs
            .map(([label, value]) => {
                const display = val(value);
                if (display === null) return null;
                return { label, value: display };
            })
            .filter(Boolean);
        if (!fields.length) return null;
        return { title, fields };
    };

    const isBook = item.source === "book-wizard" || !!item.firstName;

    const sections = [
        section("Contact", [
            ["Name", inquiryDisplayName(item)],
            ["Email", item.email],
            ["Phone", item.phone],
            ["Suburb", item.suburb || item.preferredSuburb],
            ["Subject", item.subject],
            ["Preferred contact", item.preferredContact],
            ["Preferred contact time", item.preferredContactTime],
        ]),
    ];

    if (item.message && !isBook) {
        sections.push(section("Message", [["Message", item.message]]));
    }

    if (isBook) {
        sections.push(
            section("Participant", [
                ["First name", item.firstName],
                ["Last name", item.lastName],
                ["Date of birth", item.dateOfBirth],
                ["Gender", item.gender],
                ["Suburb", item.preferredSuburb || item.suburb],
            ]),
            section("NDIS & supports", [
                ["NDIS number", item.ndisNumber],
                ["Funding type", item.fundingType],
                ["Plan manager", item.planManagerName],
                [
                    "Preferred services",
                    (item.preferredServices || "")
                        .split("|")
                        .filter(Boolean)
                        .join(", "),
                ],
            ]),
            section("Medicare", [
                ["Medicare number", item.medicareNumber],
                ["Medicare IRN", item.medicareIrn],
            ]),
            section("Health", [
                ["Allergic reactions", item.allergicReactions],
                ["Anaphylaxis risk", item.anaphylaxisRisk],
                ["Asthma", item.asthma],
                ["Behaviours of concern", item.behaviours],
                ["Medication required", item.medicationRequired],
                ["Other healthcare needs", item.otherHealthcareNeeds],
                ["Dietary restrictions", item.dietaryRestrictions],
                ["Health details", item.healthDetails],
            ]),
            section("Secondary contact", [
                ["Role", item.contactRole],
                ["Full name", item.contactFullName],
                ["Mobile", item.contactMobile],
                ["Email", item.contactEmail],
                ["Address", item.address],
                ["Emergency contact", item.emergencyContactName],
                ["Emergency phone", item.emergencyContactPhone],
                ["Anything else", item.anythingElse],
            ]),
            section("Billing", [
                ["Organisation", item.organisationName],
                ["Organisation details", item.organisationDetails],
                ["Invoice email", item.invoiceEmail],
                ["Plan dates", item.planDates],
                ["Line item", item.lineItem],
            ]),
            section("Document notes", [["Notes", item.documentNames]])
        );
    }

    return sections.filter(Boolean);
}

export function statusMeta(status) {
    const s = (status || "new").toLowerCase();
    if (s === "read" || s === "reviewed") {
        return { label: "Reviewed", tone: "muted" };
    }
    if (s === "archived") {
        return { label: "Archived", tone: "archived" };
    }
    return { label: "New", tone: "new" };
}
