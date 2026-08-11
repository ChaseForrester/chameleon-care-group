import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/generate-blog
 * Body: { title: string }
 * Uses SpaceXAI / xAI (OpenAI-compatible) to draft excerpt + HTML body from a title.
 */
export async function POST(request) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            {
                ok: false,
                error:
                    "AI is not configured. Add XAI_API_KEY in Vercel env (or .env.local) from https://console.x.ai",
            },
            { status: 503 }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const title = String(body?.title || "").trim();
    if (title.length < 4) {
        return NextResponse.json(
            { ok: false, error: "Enter a title of at least 4 characters." },
            { status: 400 }
        );
    }

    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.x.ai/v1",
    });

    const system = `You are a content writer for Chameleon Care Group, an Australian NDIS, aged care and private nursing provider in Sutherland Shire, Illawarra, Central Coast and Greater Sydney.

Write warm, professional, person-centred content. Use Australian English spelling. Be accurate and avoid medical claims that require a clinician. Do not invent statistics.

Return ONLY valid JSON (no markdown fences) with this shape:
{
  "excerpt": "1-2 sentence summary under 180 characters",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "contentHtml": "<p>HTML body with <h2>, <p>, <ul><li>…</li></ul> only. No scripts.</p>"
}

contentHtml rules:
- Start with an intro paragraph
- Include 2–4 <h2> sections
- Include at least one bullet list where helpful
- End with a short call-to-action to contact Chameleon Care Group or book supports
- Keep total length roughly 450–750 words`;

    try {
        const completion = await client.chat.completions.create({
            model: process.env.XAI_MODEL || "grok-4.5",
            temperature: 0.7,
            messages: [
                { role: "system", content: system },
                {
                    role: "user",
                    content: `Write a blog article for this title:\n\n${title}`,
                },
            ],
        });

        const raw = completion.choices?.[0]?.message?.content || "";
        const parsed = parseModelJson(raw);
        if (!parsed?.contentHtml) {
            return NextResponse.json(
                { ok: false, error: "AI returned an unexpected format. Try again." },
                { status: 502 }
            );
        }

        return NextResponse.json({
            ok: true,
            excerpt: String(parsed.excerpt || "").slice(0, 220),
            tags: Array.isArray(parsed.tags)
                ? parsed.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 6)
                : [],
            contentHtml: String(parsed.contentHtml),
        });
    } catch (err) {
        console.error("[generate-blog]", err);
        return NextResponse.json(
            {
                ok: false,
                error: err?.message || "AI generation failed. Check XAI_API_KEY and credits.",
            },
            { status: 502 }
        );
    }
}

function parseModelJson(raw) {
    if (!raw) return null;
    let text = String(raw).trim();
    // Strip ```json fences if the model adds them
    if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }
    try {
        return JSON.parse(text);
    } catch {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1));
            } catch {
                return null;
            }
        }
        return null;
    }
}
