import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) redirect(`/support?err=${encodeURIComponent(`Auth error: ${userErr.message}`)}`);
  if (!userData?.user) redirect("/login");

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id,project_id,job_type,status,created_at,updated_at,error")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) redirect(`/support?err=${encodeURIComponent(`Jobs fetch failed: ${error.message}`)}`);

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Jobs</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/projects">Projects</a>
          <a href="/debug">Debug</a>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {(jobs ?? []).map((j: any) => (
          <a
            key={j.id}
            href={`/job?id=${encodeURIComponent(j.id)}`}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, display: "block", textDecoration: "none" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 700 }}>{j.job_type}</div>
              <div style={{ opacity: 0.8 }}>{j.status}</div>
            </div>
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
              id: <code>{j.id}</code>
            </div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>
              project: <code>{j.project_id}</code>
            </div>
            {j.error ? (
              <div style={{ marginTop: 6, color: "#b00", fontSize: 12, whiteSpace: "pre-wrap" }}>{j.error}</div>
            ) : null}
          </a>
        ))}
      </div>
    </main>
  );
}
