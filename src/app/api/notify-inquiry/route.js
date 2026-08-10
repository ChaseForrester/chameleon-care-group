import { NextResponse } from "next/server";
import {
    sendInquiryConfirmation,
    sendInquiryNotification,
} from "@/lib/sendMail";

export const runtime = "nodejs";

const MAX_BODY_CHARS = 200_000;

function isValidEmail(value) {
    return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * POST /api/notify-inquiry
 * Sends staff notification email for a form submission.
 * Body: inquiry fields (same shape as Firestore inquiry docs).
 */
export async function POST(request) {
    let data;
    try {
        const text = await request.text();
        if (!text || text.length > MAX_BODY_CHARS) {
            return NextResponse.json(
                { ok: false, error: "Invalid request body" },
                { status: 400 }
            );
        }
        data = JSON.parse(text);
    } catch {
        return NextResponse.json(
            { ok: false, error: "Invalid JSON" },
            { status: 400 }
        );
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return NextResponse.json(
            { ok: false, error: "Expected an object payload" },
            { status: 400 }
        );
    }

    // Honeypot — bots fill hidden "website" / "company_url" fields
    if (data.website || data.company_url || data._gotcha) {
        return NextResponse.json({ ok: true, skipped: true });
    }

    const hasContact =
        (data.name && String(data.name).trim()) ||
        (data.firstName && String(data.firstName).trim()) ||
        (data.email && String(data.email).trim());

    if (!hasContact) {
        return NextResponse.json(
            { ok: false, error: "Missing contact details" },
            { status: 400 }
        );
    }

    // Soft-validate email if present
    if (data.email && !isValidEmail(data.email)) {
        return NextResponse.json(
            { ok: false, error: "Invalid email address" },
            { status: 400 }
        );
    }

    try {
        const notify = await sendInquiryNotification(data);

        if (!notify.ok) {
            console.error("[notify-inquiry] staff email failed:", notify);
            return NextResponse.json(
                {
                    ok: false,
                    error: notify.error || "Failed to send notification email",
                    provider: notify.provider,
                },
                { status: 502 }
            );
        }

        // Best-effort confirmation to the submitter (Resend only)
        let confirmation = { ok: false, skipped: true };
        try {
            confirmation = await sendInquiryConfirmation(data);
        } catch (err) {
            console.warn("[notify-inquiry] confirmation failed:", err);
        }

        return NextResponse.json({
            ok: true,
            provider: notify.provider,
            id: notify.id,
            confirmation: confirmation.ok
                ? { ok: true, provider: confirmation.provider }
                : { ok: false },
        });
    } catch (err) {
        console.error("[notify-inquiry] unexpected error:", err);
        return NextResponse.json(
            { ok: false, error: "Email service error" },
            { status: 500 }
        );
    }
}
