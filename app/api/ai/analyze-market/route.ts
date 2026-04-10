import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { rateLimiter, globalRateLimiter } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validations";
import { supabase } from "@/lib/supabase";

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
  const { projectId, industry, productCategory, competitors } = body;

  if (!projectId || !industry?.trim() || !productCategory?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanIndustry = sanitizeInput(industry, 200);
  const cleanCategory = sanitizeInput(productCategory, 200);
  const cleanCompetitors = (
    competitors as Array<{ name: string; description?: string }>
  )
    .slice(0, 5)
    .map((c) => ({
      name: sanitizeInput(c.name, 100),
      description: sanitizeInput(c.description ?? "", 300),
    }))
    .filter((c) => c.name.trim());

  if (!cleanIndustry || !cleanCategory || cleanCompetitors.length < 1) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("orbit_projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const competitorList = cleanCompetitors
    .map((c) => `- ${c.name}${c.description ? `: ${c.description}` : ""}`)
    .join("\n");

  const prompt = `You are a senior marketing strategist and competitive analyst.

Analyze this market and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Industry: ${cleanIndustry}
Product Category: ${cleanCategory}
Known Competitors:
${competitorList}

Return this exact JSON structure:
{
  "summary": "2-3 sentence market overview",
  "competitorMap": [
    {
      "name": "competitor name",
      "description": "what they do and who they serve",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "priceScore": 7,
      "featureScore": 5
    }
  ],
  "marketGaps": ["specific unmet need 1", "specific unmet need 2", "specific unmet need 3", "specific unmet need 4"],
  "whitespaceOpportunities": ["specific positioning opportunity 1", "specific positioning opportunity 2", "specific positioning opportunity 3"],
  "positioning": []
}

Rules:
- priceScore: 1 (free/very cheap) to 10 (very expensive/enterprise-only)
- featureScore: 1 (minimal/simple) to 10 (feature-rich/complex)
- Include every competitor listed above in competitorMap
- marketGaps: specific unmet customer needs, not generic observations
- whitespaceOpportunities: concrete positioning angles to differentiate a new entrant
- Be specific to the ${cleanIndustry} / ${cleanCategory} context, not generic marketing advice`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL.deep,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);

    await supabase
      .from("orbit_projects")
      .update({ market_intel: result, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);

    return NextResponse.json(
      { data: result },
      { headers: { "X-Credits-Remaining": String(remaining - 1) } }
    );
  } catch (err) {
    console.error("Market intel AI error:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
