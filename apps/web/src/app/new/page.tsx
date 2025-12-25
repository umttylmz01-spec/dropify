import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function NewProjectPage() {
  async function createProject(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!name) return;

    const supabase = await createClient();

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) redirect("/login");

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        name,
        description: description || null,
        config: {},
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      redirect(`/support?err=${encodeURIComponent(error?.message || "Insert failed")}`);
    }

    redirect(`/project/${data.id}`);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>New Project</h1>

      <form action={createProject} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label>
          Name
          <input name="name" placeholder="My first Dropify app" style={{ width: "100%", padding: 8 }} />
        </label>

        <label>
          Description
          <textarea name="description" placeholder="Optional" style={{ width: "100%", padding: 8, minHeight: 96 }} />
        </label>

        <button type="submit" style={{ padding: 10 }}>
          Create
        </button>
      </form>
    </main>
  );
}


