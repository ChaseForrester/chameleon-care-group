/** Public enquiry inbox — Tech Aid admin email is login-only, not shown on the site */
export const PUBLIC_EMAIL = "chameleonnursingcare@gmail.com";

export const NOTIFY_EMAILS = [PUBLIC_EMAIL];

export const NOTIFY_MAILTO = PUBLIC_EMAIL;

/** Super admin accounts (login only — never shown on public pages) */
export const ADMIN_EMAILS = [
    "chameleonnursingcare@gmail.com",
    "hello@techaidaustralia.com.au",
];

export function buildMailto({ subject, body }) {
    return `mailto:${NOTIFY_MAILTO}?subject=${encodeURIComponent(
        subject || "Website enquiry"
    )}&body=${encodeURIComponent(body || "")}`;
}
