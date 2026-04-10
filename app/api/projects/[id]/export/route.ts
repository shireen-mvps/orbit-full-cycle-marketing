import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildProjectPDF } from "@/lib/pdf-builder";
import type { OrbitProject } from "@/types/orbit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data: project, error } = await supabase
    .from("orbit_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single<OrbitProject>();

  if (error || !project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await buildProjectPDF(project);
  const filename = `${project.name.replace(/[^a-z0-9]/gi, "-")}-orbit-report.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
