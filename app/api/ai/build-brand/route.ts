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
      { error: "Daily demo limit reached (6 credits/day). Clone the repo to run your own instance: github.com/shireen-mvps/orbit-full-cycle-marketing" },
      { status: 429, headers: { "X-Credits-Remaining": "0" } }
    );
  }

  const body = await req.json();
  const { projectId, productName, productDescription, uniqueFeatures, targetMarket } = body;

  if (!projectId || !productName?.trim() || !productDescription?.trim() || !targetMarket?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanName = sanitizeInput(productName, 100);
  const cleanDesc = sanitizeInput(productDescription, 500);
  const cleanFeatures = (uniqueFeatures as string[])
    .slice(0, 3)
    .map((f) => sanitizeInput(f, 200))
    .filter(Boolean);
  const cleanMarket = sanitizeInput(targetMarket, 300);

  // Fetch project to get M1 context
  const { data: project, error: projectError } = await supabase
    .from("orbit_projects")
    .select("id, market_intel")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single<Pick<OrbitProject, "id" | "market_intel">>();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const m1Context = project.market_intel
    ? `
Market Intelligence Context (from Module 1):
- Market Gaps: ${project.market_intel.marketGaps?.join("; ") ?? "N/A"}
- Whitespace Opportunities: ${project.market_intel.whitespaceOpportunities?.join("; ") ?? "N/A"}
- Top Competitors: ${project.market_intel.competitorMap?.map((c) => c.name).join(", ") ?? "N/A"}
`
    : "";

  const prompt = `You are a senior brand strategist and copywriter.

Build a complete brand foundation and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Product: ${cleanName}
Description: ${cleanDesc}
Unique Features: ${cleanFeatures.join(", ") || "Not specified"}
Target Market: ${cleanMarket}
${m1Context}

Return this exact JSON structure:
{
  "positioningStatement": "For [target market] who [pain point], [product name] is a [category] that [key benefit]. Unlike [competitor alternative], our product [key differentiator].",
  "valueProp": "1-2 sentence clear value proposition",
  "messagingPillars": [
    { "title": "Pillar Name", "description": "2-3 sentence explanation of this messaging pillar", "icon": "emoji" },
    { "title": "Pillar Name", "description": "2-3 sentence explanation", "icon": "emoji" },
    { "title": "Pillar Name", "description": "2-3 sentence explanation", "icon": "emoji" }
  ],
  "brandVoice": ["voice descriptor 1", "voice descriptor 2", "voice descriptor 3", "voice descriptor 4", "voice descriptor 5"],
  "taglines": ["tagline option 1", "tagline option 2", "tagline option 3"],
  "selectedTagline": ""
}

Rules:
- positioningStatement: use the exact template format provided
- messagingPillars: exactly 3 pillars, each grounded in the unique features and market gaps
- brandVoice: single adjectives or short phrases (e.g. "Bold but approachable", "Data-driven")
- taglines: punchy, memorable, under 8 words each
- All output must be specific to ${cleanName}, not generic
${m1Context ? "- Reference the market gaps and whitespace opportunities in your positioning" : ""}`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL.deep,
      max_tokens: 1500,
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
      .update({ brand_foundation: result, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);

    return NextResponse.json(
      { data: result },
      { headers: { "X-Credits-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("Brand foundation AI error:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
