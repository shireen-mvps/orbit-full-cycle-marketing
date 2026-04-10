import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { rateLimiter, globalRateLimiter } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import type { OrbitProject } from "@/types/orbit";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success: globalOk } = await globalRateLimiter.limit("global");
  if (!globalOk) {
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const { success, remaining } = await rateLimiter.limit(userId);
  if (!success) {
    return NextResponse.json(
      { error: "Daily AI credit limit reached (10/day). Try again tomorrow." },
      { status: 429, headers: { "X-Credits-Remaining": "0" } }
    );
  }

  const body = await req.json();
  const { projectId, targetMarketDescription, painPoints, channels } = body;

  if (!projectId || !targetMarketDescription?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanDesc = sanitizeInput(targetMarketDescription, 500);
  const cleanPain = sanitizeInput(painPoints ?? "", 400);
  const cleanChannels = sanitizeInput(channels ?? "", 300);

  const { data: project, error: projectError } = await supabase
    .from("orbit_projects")
    .select("id, market_intel, brand_foundation")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single<Pick<OrbitProject, "id" | "market_intel" | "brand_foundation">>();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const brandContext = project.brand_foundation
    ? `
Brand Foundation Context (from Module 2):
- Value Proposition: ${project.brand_foundation.valueProp ?? "N/A"}
- Brand Voice: ${project.brand_foundation.brandVoice?.join(", ") ?? "N/A"}
- Tagline: ${project.brand_foundation.selectedTagline || project.brand_foundation.taglines?.[0] || "N/A"}
- Messaging Pillars: ${project.brand_foundation.messagingPillars?.map((p) => p.title).join(", ") ?? "N/A"}
`
    : "";

  const marketContext = project.market_intel
    ? `
Market Intelligence Context (from Module 1):
- Market Gaps: ${project.market_intel.marketGaps?.join("; ") ?? "N/A"}
- Whitespace: ${project.market_intel.whitespaceOpportunities?.join("; ") ?? "N/A"}
`
    : "";

  const prompt = `You are a senior market researcher and audience strategist.

Generate 3 detailed buyer personas and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Target Market: ${cleanDesc}
${cleanPain ? `Known Pain Points: ${cleanPain}` : ""}
${cleanChannels ? `Channels They Use: ${cleanChannels}` : ""}
${brandContext}${marketContext}

Return this exact JSON structure:
{
  "personas": [
    {
      "name": "First name only",
      "role": "Job title or life role",
      "ageRange": "e.g. 28-35",
      "psychographicSummary": "2-3 sentences describing their mindset, values, and motivations",
      "painPoints": ["specific pain point 1", "specific pain point 2", "specific pain point 3"],
      "buyingTriggers": ["trigger 1", "trigger 2", "trigger 3"],
      "objections": ["objection 1", "objection 2"],
      "preferredChannels": ["channel 1", "channel 2", "channel 3"],
      "sampleAdHook": "A single compelling ad headline or hook for this persona"
    }
  ]
}

Rules:
- Exactly 3 personas, each meaningfully different from each other
- Each persona must feel like a real person, not a demographic segment
- painPoints, buyingTriggers, objections must be specific to the target market
- sampleAdHook must speak directly to that persona's pain point and desires
${brandContext ? "- Align each persona's triggers and hooks with the brand voice and value proposition" : ""}
- Make personas diverse in role, seniority, or use case where possible`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL.deep,
      max_tokens: 2500,
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
      .update({ audience_studio: result, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);

    return NextResponse.json(
      { data: result },
      { headers: { "X-Credits-Remaining": String(remaining - 1) } }
    );
  } catch (err) {
    console.error("Personas AI error:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
