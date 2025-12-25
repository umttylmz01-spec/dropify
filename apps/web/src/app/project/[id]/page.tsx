import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, description, config, created_at, updated_at")
    .eq("id", params.id)
    .single();

  if (error || !project) {
    redirect("/support?err=" + encodeURIComponent("Project not found or access denied"));
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{project.name}</h1>
      <p>{project.description || "No description"}</p>

      <pre style={{ padding: 12, background: "#f6f6f6", overflowX: "auto" }}>
        {JSON.stringify(project, null, 2)}
      </pre>
    </main>
  );
}

