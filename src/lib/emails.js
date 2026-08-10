/** Dual inbox for enquiries and admin access */
export const NOTIFY_EMAILS = [
    "chameleonnursingcare@gmail.com",
    "hello@techaidaustralia.com.au",
];

export const NOTIFY_MAILTO = NOTIFY_EMAILS.join(",");

export function buildMailto({ subject, body }) {
    return `mailto:${NOTIFY_MAILTO}?subject=${encodeURIComponent(
        subject || "Website enquiry"
    )}&body=${encodeURIComponent(body || "")}`;
}
