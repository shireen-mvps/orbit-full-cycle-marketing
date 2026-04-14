import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ContentStudioModule } from "@/components/orbit/content-studio-module";
import type { OrbitProject } from "@/types/orbit";

export default async function ContentStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { data: project } = await supabase
    .from("orbit_projects")
    .select("id, name, brand_foundation, audience_studio, campaign_plan, content_studio")
    .eq("id", id)
    .eq("user_id", userId)
    .single<
      Pick<
        OrbitProject,
        "id" | "name" | "brand_foundation" | "audience_studio" | "campaign_plan" | "content_studio"
      >
    >();

  if (!project) redirect("/dashboard");

  // Guard: must have a selected campaign concept before accessing Content Studio
  if (
    !project.campaign_plan ||
    project.campaign_plan.selectedConcept === null ||
    project.campaign_plan.selectedConcept === undefined
  ) {
    redirect(`/projects/${id}/campaign-planner`);
  }

  return (
    <ContentStudioModule
      projectId={id}
      projectName={project.name}
      initialData={project.content_studio}
      campaignPlan={project.campaign_plan}
      brandFoundation={project.brand_foundation}
    />
  );
}
