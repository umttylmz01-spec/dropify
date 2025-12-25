import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (userErr || !user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, description, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    redirect(`/support?err=${encodeURIComponent(error.message)}`);
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Projects</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>{user.email}</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/new" style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none" }}>
            New Project
          </Link>
          <Link href="/debug" style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none" }}>
            Debug
          </Link>
        </div>
      </header>

      <section style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {projects?.length ? (
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/project/${p.id}`}
              style={{
                display: "block",
                padding: 12,
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{p.name}</strong>
                <span style={{ opacity: 0.7, fontSize: 12 }}>{new Date(p.created_at).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 6, opacity: 0.85 }}>{p.description || "No description"}</div>
            </Link>
          ))
        ) : (
          <div style={{ padding: 14, border: "1px dashed #ccc", borderRadius: 12 }}>
            No projects yet. <Link href="/new">Create your first project</Link>.
          </div>
        )}
      </section>
    </main>
  );
}
