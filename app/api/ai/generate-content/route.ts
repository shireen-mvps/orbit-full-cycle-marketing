import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { checkLifetimeLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import type { OrbitProject } from "@/types/orbit";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success, remaining } = await checkLifetimeLimit(userId);
  if (!success) {
    return NextResponse.json(
      { error: "Demo limit reached (5 credits). Clone the repo to run your own instance." },
      { status: 429, headers: { "X-Credits-Remaining": "0" } }
    );
  }

  const body = await req.json();
  const { projectId, formats } = body;

  if (!projectId || !Array.isArray(formats) || formats.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanFormats = formats
    .slice(0, 6)
    .map((f: string) => sanitizeInput(f, 50))
    .filter(Boolean);

  const { data: project, error: projectError } = await supabase
    .from("orbit_projects")
    .select("id, brand_foundation, audience_studio, campaign_plan")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single<Pick<OrbitProject, "id" | "brand_foundation" | "audience_studio" | "campaign_plan">>();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const m2 = project.brand_foundation;
  const m3 = project.audience_studio;
  const m4 = project.campaign_plan;

  if (!m4 || m4.selectedConcept === null || m4.selectedConcept === undefined) {
    return NextResponse.json({ error: "No campaign concept selected" }, { status: 400 });
  }

  const selectedConcept = m4.concepts?.[m4.selectedConcept];
  if (!selectedConcept) {
    return NextResponse.json({ error: "Selected concept not found" }, { status: 400 });
  }

  const primaryPersona = m3?.personas?.[0];

  const brandVoice = m2?.brandVoice?.join(", ") ?? "N/A";
  const messagingPillars = m2?.messagingPillars?.map((p) => p.title).join(", ") ?? "N/A";

  const personaContext = primaryPersona
    ? `Name: ${primaryPersona.name}, Role: ${primaryPersona.role}
Psychographic: ${primaryPersona.psychographicSummary ?? "N/A"}
Pain Points: ${primaryPersona.painPoints?.join("; ") ?? "N/A"}
Preferred Channels: ${primaryPersona.preferredChannels?.join(", ") ?? "N/A"}`
    : "N/A";

  const conceptContext = `Name: ${selectedConcept.name}
Hook: ${selectedConcept.hook}
Angle: ${selectedConcept.angle}
Core Message: ${selectedConcept.coreMessage}
CTA: ${selectedConcept.cta}`;

  const allFormats = [
    "Instagram Post",
    "LinkedIn Post",
    "Email Newsletter",
    "Facebook Ad",
    "Google Search Ad",
    "Blog Intro",
    "X/Twitter Post",
  ];

  const prompt = `You are a senior copywriter. Write conversion-focused copy using the brand voice, persona, and campaign concept below. Return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Brand Voice: ${brandVoice}
Messaging Pillars: ${messagingPillars}

Primary Persona:
${personaContext}

Campaign Concept:
${conceptContext}

Formats requested: ${cleanFormats.join(", ")}

Return this exact JSON structure:
{
  "selectedConceptName": "${selectedConcept.name}",
  "variants": [
    {
      "format": "Format name",
      "headline": "Attention-grabbing headline or subject line",
      "body": "Main copy body (2-4 sentences, format-appropriate length)",
      "cta": "Action-oriented CTA"
    }
  ],
  "repurposeMatrix": [
    { "format": "Format name", "adaptation": "One sentence describing how the core message adapts for this format" }
  ]
}

Rules:
- variants: one entry per requested format, in the order requested
- repurposeMatrix: exactly 7 rows covering ALL of these formats: ${allFormats.join(", ")}
- Each variant must have distinct tone appropriate to the platform (Instagram is punchy/visual, Email is personal, Google Ad is direct/benefit-led)
- Write as if speaking directly to the persona's pain points and triggers
- All copy must align with the brand voice: ${brandVoice}
- Body copy length: Instagram 1-2 sentences, Email 3-4 sentences, Blog Intro 3-4 sentences, Ads 1-2 sentences
- Never use em-dashes. Use commas, colons, or periods instead.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL.fast,
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);

    await supabase
      .from("orbit_projects")
      .update({ content_studio: result, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);

    return NextResponse.json(
      { data: result },
      { headers: { "X-Credits-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("Content studio AI error:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
