import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) redirect(`/support?err=${encodeURIComponent(`Auth error: ${userErr.message}`)}`);
  if (!userData?.user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id,name,description,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) redirect(`/support?err=${encodeURIComponent(`Projects fetch failed: ${error.message}`)}`);

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Projects</h1>
        <a href="/new">New Project</a>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {(projects ?? []).map((p: any) => {
          const id = p.id as string | undefined;
          const href = id ? `/project?id=${encodeURIComponent(id)}` : "/support?err=Missing%20id%20in%20row";

          return (
            <a
              key={id ?? Math.random()}
              href={href}
              style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, display: "block", textDecoration: "none" }}
            >
              <div style={{ fontWeight: 700 }}>{p.name ?? "(no name)"}</div>
              <div style={{ opacity: 0.8 }}>{p.description ?? ""}</div>
              <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>{String(id)}</div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
