import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (!user) redirect("/login");

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, description, config, created_at, updated_at")
    .eq("id", params.id)
    .single();

  if (error || !project) {
    redirect("/support?err=" + encodeURIComponent("Project not found or access denied"));
  }

  async function updateProject(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!name) redirect(`/support?err=${encodeURIComponent("Name is required")}`);

    const { error } = await supabase
      .from("projects")
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) redirect(`/support?err=${encodeURIComponent(error.message)}`);

    redirect(`/project/${params.id}`);
  }

  async function deleteProject() {
    "use server";
    const supabase = await createClient();

    const { error } = await supabase.from("projects").delete().eq("id", params.id);
    if (error) redirect(`/support?err=${encodeURIComponent(error.message)}`);

    redirect("/projects");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900 }}>
      <h1 style={{ marginTop: 0 }}>Project</h1>

      <section style={{ marginTop: 12, padding: 12, border: "1px solid #e5e5e5", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Edit</h2>

        <form action={updateProject} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            Name
            <input
              name="name"
              defaultValue={project.name}
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            Description
            <textarea
              name="description"
              defaultValue={project.description || ""}
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, minHeight: 90 }}
            />
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="submit"
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}
            >
              Save
            </button>

            <form action={deleteProject}>
              <button
                type="submit"
                style={{
                  padding: "8px 12px",
                  border: "1px solid #f0caca",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </form>
          </div>
        </form>
      </section>

      <section style={{ marginTop: 12 }}>
        <h2>Raw</h2>
        <pre style={{ padding: 12, background: "#f6f6f6", overflowX: "auto" }}>
          {JSON.stringify(project, null, 2)}
        </pre>
      </section>
    </main>
  );
}
