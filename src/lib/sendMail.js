/**
 * Server-only email delivery for form notifications.
 *
 * Providers (first match wins):
 * 1. Resend — set RESEND_API_KEY (+ optional RESEND_FROM)
 * 2. FormSubmit — zero-config fallback to the public inbox
 *    (first use requires clicking the activation email FormSubmit sends)
 */

import {
    formatInquiryHtml,
    formatInquiryPlainText,
    getNotifyEmails,
    inquirySubject,
    PUBLIC_EMAIL,
} from "@/lib/emails";

function getFromAddress() {
    return (
        process.env.RESEND_FROM ||
        process.env.EMAIL_FROM ||
        "Chameleon Care Group <onboarding@resend.dev>"
    );
}

/**
 * Send via Resend REST API.
 * @returns {Promise<{ ok: boolean, provider: string, id?: string, error?: string }>}
 */
async function sendWithResend({ to, replyTo, subject, text, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return { ok: false, provider: "resend", error: "RESEND_API_KEY not set" };
    }

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: getFromAddress(),
            to: Array.isArray(to) ? to : [to],
            reply_to: replyTo || undefined,
            subject,
            text,
            html,
        }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        return {
            ok: false,
            provider: "resend",
            error: body?.message || body?.error || `Resend HTTP ${res.status}`,
        };
    }

    return { ok: true, provider: "resend", id: body?.id };
}

/**
 * Send via FormSubmit (no API key). Activates on first send to an inbox.
 * @returns {Promise<{ ok: boolean, provider: string, error?: string }>}
 */
async function sendWithFormSubmit({ to, replyTo, subject, text, data }) {
    const inbox = Array.isArray(to) ? to[0] : to;
    if (!inbox) {
        return { ok: false, provider: "formsubmit", error: "No recipient" };
    }

    // FormSubmit free tier: one primary inbox per form endpoint.
    // Extra recipients get a copy note in the body.
    const extras = (Array.isArray(to) ? to.slice(1) : []).filter(Boolean);
    const payload = {
        name: data.name || [data.firstName, data.lastName].filter(Boolean).join(" ") || "Website visitor",
        email: replyTo || data.email || PUBLIC_EMAIL,
        phone: data.phone || data.contactMobile || "",
        suburb: data.suburb || data.preferredSuburb || "",
        source: data.source || "website",
        subject: subject,
        message: text,
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _replyto: replyTo || data.email || "",
        ...(extras.length
            ? { _cc: extras.join(",") }
            : {}),
    };

    const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        return {
            ok: false,
            provider: "formsubmit",
            error: body?.message || body?.error || `FormSubmit HTTP ${res.status}`,
        };
    }

    // FormSubmit returns success even when inbox needs activation —
    // the activation email is the first message the inbox receives.
    return { ok: true, provider: "formsubmit" };
}

/**
 * Notify staff of a new inquiry. Prefers Resend, falls back to FormSubmit.
 * @param {Record<string, unknown>} data
 */
export async function sendInquiryNotification(data = {}) {
    const to = getNotifyEmails();
    const subject = inquirySubject(data);
    const text = formatInquiryPlainText(data);
    const html = formatInquiryHtml(data);
    const replyTo =
        typeof data.email === "string" && data.email.includes("@")
            ? data.email
            : typeof data.contactEmail === "string" && data.contactEmail.includes("@")
                ? data.contactEmail
                : undefined;

    const payload = { to, replyTo, subject, text, html, data };

    if (process.env.RESEND_API_KEY) {
        const result = await sendWithResend(payload);
        if (result.ok) return result;
        // Fall through to FormSubmit if Resend fails
        console.warn("[sendMail] Resend failed, trying FormSubmit:", result.error);
    }

    // Allow disabling public fallback (e.g. if you only want Resend)
    if (process.env.DISABLE_FORMSUBMIT_FALLBACK === "true") {
        return {
            ok: false,
            provider: "none",
            error:
                process.env.RESEND_API_KEY
                    ? "Resend failed and FormSubmit fallback is disabled"
                    : "No email provider configured (set RESEND_API_KEY)",
        };
    }

    return sendWithFormSubmit(payload);
}

/**
 * Optional confirmation email to the person who submitted the form.
 * Only sent when Resend is configured (FormSubmit autoresponse is less reliable).
 */
export async function sendInquiryConfirmation(data = {}) {
    if (!process.env.RESEND_API_KEY) {
        return { ok: false, provider: "resend", error: "skipped — no RESEND_API_KEY" };
    }

    const to = data.email || data.contactEmail;
    if (!to || typeof to !== "string" || !to.includes("@")) {
        return { ok: false, provider: "resend", error: "no submitter email" };
    }

    const name =
        data.name ||
        [data.firstName, data.lastName].filter(Boolean).join(" ") ||
        "there";

    const subject = "We received your message — Chameleon Care Group";
    const text = [
        `Hi ${name},`,
        "",
        "Thank you for contacting Chameleon Care Group. We have received your enquiry and will be in touch shortly.",
        "",
        "For urgent needs, please call us on 0430 068 300.",
        "",
        "Kind regards,",
        "Chameleon Care Group",
        "chameleonnursingcare@gmail.com",
        "https://www.chameleoncaregroup.com.au",
    ].join("\n");

    const html = `<!DOCTYPE html>
<html><body style="font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#111827;line-height:1.5">
  <p>Hi ${name.replace(/[<>&"]/g, "")},</p>
  <p>Thank you for contacting <strong>Chameleon Care Group</strong>. We have received your enquiry and will be in touch shortly.</p>
  <p>For urgent needs, please call us on <a href="tel:0430068300">0430 068 300</a>.</p>
  <p style="margin-top:24px">Kind regards,<br/>Chameleon Care Group<br/>
  <a href="mailto:chameleonnursingcare@gmail.com">chameleonnursingcare@gmail.com</a></p>
</body></html>`;

    return sendWithResend({
        to: [to],
        subject,
        text,
        html,
    });
}
