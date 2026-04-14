import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CampaignPlannerModule } from "@/components/orbit/campaign-planner-module";
import type { OrbitProject } from "@/types/orbit";

export default async function CampaignPlannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { data: project } = await supabase
    .from("orbit_projects")
    .select("id, name, brand_foundation, audience_studio, campaign_plan")
    .eq("id", id)
    .eq("user_id", userId)
    .single<
      Pick<OrbitProject, "id" | "name" | "brand_foundation" | "audience_studio" | "campaign_plan">
    >();

  if (!project) redirect("/dashboard");

  return (
    <CampaignPlannerModule
      projectId={id}
      projectName={project.name}
      initialData={project.campaign_plan}
      brandFoundation={project.brand_foundation}
      audienceStudio={project.audience_studio}
    />
  );
}
