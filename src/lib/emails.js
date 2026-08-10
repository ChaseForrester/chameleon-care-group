/** Public enquiry inbox — Tech Aid admin email is login-only, not shown on the site */
export const PUBLIC_EMAIL = "chameleonnursingcare@gmail.com";

/** Default inboxes that receive form notifications */
export const NOTIFY_EMAILS = [PUBLIC_EMAIL];

export const NOTIFY_MAILTO = PUBLIC_EMAIL;

/** Super admin accounts (login only — never shown on public pages) */
export const ADMIN_EMAILS = [
    "chameleonnursingcare@gmail.com",
    "hello@techaidaustralia.com.au",
];

/** Resolve notification recipients (env override supported on the server). */
export function getNotifyEmails() {
    const fromEnv = process.env.NOTIFY_EMAILS;
    if (fromEnv && fromEnv.trim()) {
        return fromEnv
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);
    }
    return [...NOTIFY_EMAILS];
}

export function buildMailto({ subject, body }) {
    return `mailto:${NOTIFY_MAILTO}?subject=${encodeURIComponent(
        subject || "Website enquiry"
    )}&body=${encodeURIComponent(body || "")}`;
}

/** Human-readable source labels for emails and admin. */
export function sourceLabel(source) {
    const map = {
        contact: "Contact form",
        "contact-us": "Contact form",
        referral: "Referral form",
        "book-wizard": "Book with us application",
        book: "Book with us application",
    };
    return map[source] || source || "Website enquiry";
}

/**
 * Build plain-text body from an inquiry payload.
 * Handles both simple contact forms and the full book wizard.
 */
export function formatInquiryPlainText(data = {}) {
    const lines = [];
    const push = (label, value) => {
        if (value === undefined || value === null || value === "" || value === false) return;
        if (typeof value === "boolean") {
            lines.push(`${label}: ${value ? "Yes" : "No"}`);
            return;
        }
        lines.push(`${label}: ${String(value)}`);
    };

    lines.push(`Source: ${sourceLabel(data.source)}`);
    lines.push("");

    // Contact / referral fields
    push("Name", data.name);
    push("First name", data.firstName);
    push("Last name", data.lastName);
    push("Email", data.email);
    push("Phone", data.phone);
    push("Suburb", data.suburb || data.preferredSuburb);
    push("Subject", data.subject);
    push("Preferred contact", data.preferredContact);
    push("Preferred contact time", data.preferredContactTime);

    if (data.message && data.source !== "book-wizard") {
        lines.push("");
        lines.push("Message:");
        lines.push(String(data.message));
    }

    // Book wizard extras
    if (data.source === "book-wizard" || data.firstName) {
        lines.push("");
        lines.push("--- Application details ---");
        push("Date of birth", data.dateOfBirth);
        push("NDIS number", data.ndisNumber);
        push("Funding type", data.fundingType);
        push("Plan manager", data.planManagerName);
        push(
            "Preferred services",
            (data.preferredServices || "").split("|").filter(Boolean).join(", ")
        );
        push("Medicare number", data.medicareNumber);
        push("Medicare IRN", data.medicareIrn);
        push("Gender", data.gender);
        push("Allergic reactions", data.allergicReactions);
        push("Anaphylaxis risk", data.anaphylaxisRisk);
        push("Asthma", data.asthma);
        push("Behaviours of concern", data.behaviours);
        push("Medication required", data.medicationRequired);
        push("Other healthcare needs", data.otherHealthcareNeeds);
        push("Dietary restrictions", data.dietaryRestrictions);
        push("Health details", data.healthDetails);
        push("Contact role", data.contactRole);
        push("Address", data.address);
        push("Contact full name", data.contactFullName);
        push("Contact mobile", data.contactMobile);
        push("Contact email", data.contactEmail);
        push("Emergency contact name", data.emergencyContactName);
        push("Emergency contact phone", data.emergencyContactPhone);
        push("Anything else", data.anythingElse);
        push("Document notes", data.documentNames);
        push("Organisation", data.organisationName);
        push("Organisation details", data.organisationDetails);
        push("Invoice email", data.invoiceEmail);
        push("Plan dates", data.planDates);
        push("Line item", data.lineItem);
    }

    const docs = Array.isArray(data.documents) ? data.documents.filter((d) => d?.url) : [];
    if (docs.length) {
        lines.push("");
        lines.push("--- Attached documents ---");
        docs.forEach((d, i) => {
            lines.push(`${i + 1}. ${d.name || "Document"}`);
            lines.push(`   ${d.url}`);
        });
    }

    lines.push("");
    lines.push("---");
    lines.push("Submitted via chameleoncaregroup.com.au");
    return lines.join("\n");
}

/** Escape HTML for safe email rendering. */
export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Build a simple HTML email for staff notifications. */
export function formatInquiryHtml(data = {}) {
    const plain = formatInquiryPlainText(data);
    const docs = Array.isArray(data.documents) ? data.documents.filter((d) => d?.url) : [];

    // Strip raw document URL lines from plain text — we render a nicer block below
    const plainWithoutDocUrls = plain
        .split("\n")
        .filter((line) => {
            const t = line.trim();
            if (t.startsWith("--- Attached documents")) return false;
            if (/^\d+\.\s/.test(t) && docs.some((d) => t.includes(d.name || ""))) return false;
            if (t.startsWith("http") && docs.some((d) => d.url && t.includes(d.url))) return false;
            return true;
        })
        .join("\n");

    const rows = plainWithoutDocUrls
        .split("\n")
        .map((line) => {
            if (!line.trim()) return "<tr><td colspan='2' style='height:8px'></td></tr>";
            if (line.startsWith("---")) {
                return `<tr><td colspan="2" style="padding:12px 0 4px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em">${escapeHtml(line.replace(/-/g, "").trim() || "Details")}</td></tr>`;
            }
            const idx = line.indexOf(":");
            if (idx > 0 && idx < 40) {
                const label = line.slice(0, idx).trim();
                const value = line.slice(idx + 1).trim();
                return `<tr>
          <td style="padding:6px 12px 6px 0;vertical-align:top;color:#374151;font-weight:600;white-space:nowrap">${escapeHtml(label)}</td>
          <td style="padding:6px 0;vertical-align:top;color:#111827;white-space:pre-wrap">${escapeHtml(value)}</td>
        </tr>`;
            }
            return `<tr><td colspan="2" style="padding:4px 0;color:#111827;white-space:pre-wrap">${escapeHtml(line)}</td></tr>`;
        })
        .join("");

    const docsBlock = docs.length
        ? `<div style="margin-top:20px;padding:16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px">
        <div style="font-weight:700;color:#0f766e;margin-bottom:10px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em">Attached documents (${docs.length})</div>
        ${docs
            .map(
                (d) =>
                    `<div style="margin:0 0 8px">
            <a href="${escapeHtml(d.url)}" style="color:#0f766e;font-weight:600;text-decoration:underline" target="_blank" rel="noopener noreferrer">${escapeHtml(d.name || "Download document")}</a>
          </div>`
            )
            .join("")}
      </div>`
        : "";

    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Segoe UI,Helvetica,Arial,sans-serif">
  <div style="max-width:640px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#0f766e;color:#fff;padding:20px 24px">
      <div style="font-size:13px;opacity:0.9">Chameleon Care Group</div>
      <h1 style="margin:4px 0 0;font-size:20px;font-weight:700">${escapeHtml(sourceLabel(data.source))}</h1>
    </div>
    <div style="padding:20px 24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.45">${rows}</table>
      ${docsBlock}
    </div>
    <div style="padding:14px 24px;background:#f9fafb;color:#6b7280;font-size:12px">
      Reply directly to this email to contact the person who submitted the form.
    </div>
  </div>
</body>
</html>`;
}

export function inquirySubject(data = {}) {
    const label = sourceLabel(data.source);
    const name = data.name || [data.firstName, data.lastName].filter(Boolean).join(" ") || "Website";
    const subject = data.subject ? ` — ${data.subject}` : "";
    return `${label}: ${name}${subject}`;
}
