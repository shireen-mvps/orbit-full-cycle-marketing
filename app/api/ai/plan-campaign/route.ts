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
  const { projectId, objective, timeline, budgetTier, channels } = body;

  if (!projectId || !objective?.trim() || !timeline?.trim() || !budgetTier) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanObjective = sanitizeInput(objective, 500);
  const cleanTimeline = sanitizeInput(timeline, 100);
  const cleanBudget = sanitizeInput(budgetTier, 50);
  const cleanChannels = Array.isArray(channels)
    ? channels.slice(0, 5).map((c: string) => sanitizeInput(c, 50)).filter(Boolean)
    : [];

  const { data: project, error: projectError } = await supabase
    .from("orbit_projects")
    .select("id, market_intel, brand_foundation, audience_studio")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single<Pick<OrbitProject, "id" | "market_intel" | "brand_foundation" | "audience_studio">>();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const m1 = project.market_intel;
  const m2 = project.brand_foundation;
  const m3 = project.audience_studio;
  const primaryPersona = m3?.personas?.[0];

  const brandContext = m2
    ? `Positioning: ${m2.positioningStatement ?? "N/A"}
Value Proposition: ${m2.valueProp ?? "N/A"}
Brand Voice: ${m2.brandVoice?.join(", ") ?? "N/A"}
Tagline: ${m2.selectedTagline || m2.taglines?.[0] || "N/A"}
Messaging Pillars: ${m2.messagingPillars?.map((p) => p.title).join(", ") ?? "N/A"}`
    : "N/A";

  const marketContext = m1
    ? `Top Competitors: ${m1.competitorMap?.slice(0, 2).map((c) => c.name).join(", ") ?? "N/A"}
Market Gaps: ${m1.marketGaps?.slice(0, 2).join("; ") ?? "N/A"}
Whitespace Opportunities: ${m1.whitespaceOpportunities?.slice(0, 2).join("; ") ?? "N/A"}`
    : "N/A";

  const personaContext = primaryPersona
    ? `Name: ${primaryPersona.name}, Role: ${primaryPersona.role}
Pain Points: ${primaryPersona.painPoints?.join("; ") ?? "N/A"}
Buying Triggers: ${primaryPersona.buyingTriggers?.join("; ") ?? "N/A"}
Preferred Channels: ${primaryPersona.preferredChannels?.join(", ") ?? "N/A"}
Sample Hook: ${primaryPersona.sampleAdHook ?? "N/A"}`
    : "N/A";

  const prompt = `You are a senior marketing strategist. Create a complete campaign plan and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Brand Context:
${brandContext}

Market Intelligence:
${marketContext}

Primary Persona:
${personaContext}

Campaign Inputs:
Objective: ${cleanObjective}
Timeline: ${cleanTimeline}
Budget Tier: ${cleanBudget}
Priority Channels: ${cleanChannels.join(", ") || "Not specified"}

Return this exact JSON structure:
{
  "brief": {
    "campaignTitle": "Short memorable campaign name",
    "objectiveStatement": "1-2 sentence campaign objective",
    "primaryMessage": "The single core message this campaign delivers",
    "targetSegment": "Who this campaign targets (reference the persona)",
    "keyInsight": "The audience truth that makes this message land",
    "successMetrics": ["metric 1", "metric 2", "metric 3"]
  },
  "messageArchitecture": {
    "primaryMessage": "The hero message",
    "supportingMessages": ["proof point 1", "proof point 2", "proof point 3"],
    "objectionHandlers": ["objection 1 + reframe", "objection 2 + reframe"]
  },
  "channelMix": [
    { "channel": "Channel name", "budgetPercent": 40, "rationale": "Why this channel for this audience" }
  ],
  "concepts": [
    {
      "name": "Concept name (e.g. The Challenger Play)",
      "hook": "One-line attention grabber",
      "angle": "The story or frame: 2-3 sentences describing the campaign angle",
      "coreMessage": "What this concept says at its core",
      "cta": "The call to action",
      "personaTarget": "Which persona this concept targets"
    }
  ],
  "selectedConcept": null
}

Rules:
- channelMix: 3-4 channels, budgetPercent values must sum to 100
- concepts: exactly 3, each meaningfully different in angle and tone
- All content must align with the brand voice and positioning
- successMetrics: specific and measurable (e.g. "200 qualified leads in 8 weeks")
- Never use em-dashes. Use commas, colons, or periods instead.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL.fast,
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
      .update({ campaign_plan: result, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);

    return NextResponse.json(
      { data: result },
      { headers: { "X-Credits-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("Campaign plan AI error:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
