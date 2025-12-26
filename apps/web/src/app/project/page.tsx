import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProject, deleteProject, upsertProjectSpecs, createJob } from "./actions";

export const dynamic = "force-dynamic";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

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

export default async function ProjectByQueryPage({ searchParams }: { searchParams: any }) {
  const id = await readParam(searchParams, "id");
  const specerr = await readParam(searchParams, "specerr");

  if (!id || id === "undefined" || !isUuid(id)) {
    redirect(`/support?err=${encodeURIComponent(`Invalid project id query: ${String(id)}`)}`);
  }

  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) redirect(`/support?err=${encodeURIComponent(`Auth error: ${userErr.message}`)}`);
  if (!userData?.user) redirect("/login");

  const { data: project, error } = await supabase
    .from("projects")
    .select("id,name,description,config,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) redirect(`/support?err=${encodeURIComponent(`Project fetch failed: ${error.message}`)}`);
  if (!project) redirect(`/support?err=${encodeURIComponent("Project not found or access denied (RLS).")}`);

  const configPretty = project.config ? JSON.stringify(project.config, null, 2) : "{}";

  let specs: any = null;
  let specsNotice: string | null = null;

  const specsRes = await supabase
    .from("project_specs")
    .select("app_spec_md,routes_json,data_model_json,api_contract_json,updated_at")
    .eq("project_id", id)
    .maybeSingle();

  if (specsRes.error) {
    const msg = specsRes.error.message || "";
    if (msg.toLowerCase().includes("does not exist") || msg.toLowerCase().includes("relation")) {
      specsNotice = 'project_specs table not found. Run the SQL migration in Supabase SQL Editor.';
    } else {
      specsNotice = `Specs fetch error: ${msg}`;
    }
  } else {
    specs = specsRes.data;
  }

  const appSpecMd = specs?.app_spec_md ?? "";
  const routesJson = JSON.stringify(specs?.routes_json ?? {}, null, 2);
  const dataModelJson = JSON.stringify(specs?.data_model_json ?? {}, null, 2);
  const apiContractJson = JSON.stringify(specs?.api_contract_json ?? {}, null, 2);
  const specsUpdatedAt = specs?.updated_at ?? null;

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Project</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/projects">Projects</a>
          <a href="/new">New</a>
          <a href="/debug">Debug</a>
          <a href="/support">Support</a>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Summary</div>
        <div><b>ID:</b> {project.id}</div>
        <div><b>Created:</b> {project.created_at}</div>
        <div><b>Updated:</b> {project.updated_at}</div>
      </div>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Edit</div>

        <form action={updateProject.bind(null, project.id)} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name</span>
            <input name="name" defaultValue={project.name ?? ""} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description</span>
            <textarea name="description" defaultValue={project.description ?? ""} rows={4} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Config (JSON)</span>
            <textarea name="config" defaultValue={configPretty} rows={10} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, fontFamily: "monospace" }} />
          </label>

          <button type="submit" style={{ padding: "8px 12px" }}>Save Project</button>
        </form>
      </div>

      <div id="specs" style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Specs (Prompt Compiler Artifacts)</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>
            {specsUpdatedAt ? `updated_at: ${specsUpdatedAt}` : ""}
          </div>
        </div>

        {specerr ? (
          <div style={{ padding: 10, border: "1px solid #f2c2c2", borderRadius: 8, marginBottom: 10 }}>
            <b>Error:</b> {specerr}
          </div>
        ) : null}

        {specsNotice ? (
          <div style={{ padding: 10, border: "1px solid #f2c2c2", borderRadius: 8, marginBottom: 10 }}>
            <b>Notice:</b> {specsNotice}
          </div>
        ) : null}

        <form action={upsertProjectSpecs.bind(null, project.id)} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>app_spec.md</span>
            <textarea name="app_spec_md" defaultValue={appSpecMd} rows={10} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, fontFamily: "monospace" }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>routes.json</span>
            <textarea name="routes_json" defaultValue={routesJson} rows={10} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, fontFamily: "monospace" }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>data_model.json</span>
            <textarea name="data_model_json" defaultValue={dataModelJson} rows={10} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, fontFamily: "monospace" }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>api_contract.json</span>
            <textarea name="api_contract_json" defaultValue={apiContractJson} rows={10} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, fontFamily: "monospace" }} />
          </label>

          <button type="submit" style={{ padding: "8px 12px" }}>Save Specs</button>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="submit"
              formAction={createJob.bind(null, project.id, "codegen")}
              style={{ padding: "8px 12px" }}
            >
              Create Codegen Job
            </button>
            <a href="/jobs" style={{ opacity: 0.8 }}>View Jobs</a>
          </div>

        </form>
      </div>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #f2c2c2", borderRadius: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Danger zone</div>
        <form action={deleteProject.bind(null, project.id)}>
          <button type="submit" style={{ padding: "8px 12px", border: "1px solid #c00" }}>Delete Project</button>
        </form>
      </div>
    </main>
  );
}


