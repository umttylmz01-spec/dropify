import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function readParam(searchParams: any, key: string): Promise<string | undefined> {
  const sp = await Promise.resolve(searchParams);
  if (sp && typeof sp.get === "function") {
    const v = sp.get(key);
    return typeof v === "string" ? v : undefined;
  }
  const raw = sp?.[key];
  if (Array.isArray(raw)) return typeof raw[0] === "string" ? raw[0] : undefined;
  return typeof raw === "string" ? raw : undefined;
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default async function JobPage({ searchParams }: { searchParams: any }) {
  const id = await readParam(searchParams, "id");
  if (!id || !isUuid(id)) {
    redirect(`/support?err=${encodeURIComponent(`Invalid job id: ${String(id)}`)}`);
  }

  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) redirect(`/support?err=${encodeURIComponent(`Auth error: ${userErr.message}`)}`);
  if (!userData?.user) redirect("/login");

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) redirect(`/support?err=${encodeURIComponent(`Job fetch failed: ${error.message}`)}`);
  if (!job) redirect(`/support?err=${encodeURIComponent("Job not found or access denied (RLS).")}`);

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Job</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/jobs">Jobs</a>
          <a href="/projects">Projects</a>
          <a href={`/project?id=${encodeURIComponent(job.project_id)}`}>Project</a>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div><b>ID:</b> <code>{job.id}</code></div>
        <div><b>Type:</b> {job.job_type}</div>
        <div><b>Status:</b> {job.status}</div>
        <div><b>Created:</b> {job.created_at}</div>
        <div><b>Updated:</b> {job.updated_at}</div>
        {job.error ? (
          <div style={{ marginTop: 10, padding: 10, border: "1px solid #f2c2c2", borderRadius: 8, whiteSpace: "pre-wrap" }}>
            <b>Error:</b> {job.error}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Input</div>
        <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
{JSON.stringify(job.input ?? {}, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Output</div>
        <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
{JSON.stringify(job.output ?? {}, null, 2)}
        </pre>
      </div>
    </main>
  );
}
