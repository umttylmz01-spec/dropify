import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function NewProjectPage() {
  async function createProject(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr) {
      redirect(`/support?err=${encodeURIComponent(`Auth error: ${userErr.message}`)}`);
    }
    if (!userData?.user) {
      redirect("/login");
    }

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name) {
      redirect(`/support?err=${encodeURIComponent("Validation: name is required")}`);
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: userData.user.id,
        name,
        description,
        config: {},
      })
      .select("id")
      .single();

    if (error) {
      redirect(`/support?err=${encodeURIComponent(`Create failed: ${error.message}`)}`);
    }

    if (!data?.id) {
      redirect(`/support?err=${encodeURIComponent("Create failed: missing id from insert result")}`);
    }

    redirect(`/project?id=${encodeURIComponent(data.id)}`);
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>New Project</h1>

      <form action={createProject} style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input name="name" style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Description</span>
          <textarea name="description" rows={4} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
        </label>

        <button type="submit" style={{ padding: "8px 12px" }}>
          Create
        </button>
      </form>
    </main>
  );
}
