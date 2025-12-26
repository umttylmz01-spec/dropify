"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeText(v: FormDataEntryValue | null, max = 2000) {
  const s = (typeof v === "string" ? v : "")?.trim() ?? "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient();

  const name = safeText(formData.get("name"), 200);
  const description = safeText(formData.get("description"), 2000);
  const configRaw = safeText(formData.get("config"), 20000);

  if (!name) {
    redirect(`/support?err=${encodeURIComponent("Validation: name is required")}`);
  }

  let config: any = {};
  if (configRaw) {
    try {
      config = JSON.parse(configRaw);
    } catch {
      redirect(`/support?err=${encodeURIComponent("Validation: config must be valid JSON")}`);
    }
  }

  const { error } = await supabase.from("projects").update({ name, description, config }).eq("id", projectId);

  if (error) {
    redirect(`/support?err=${encodeURIComponent(`Update failed: ${error.message}`)}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/project?id=${projectId}`);
  redirect(`/project?id=${projectId}`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    redirect(`/support?err=${encodeURIComponent(`Delete failed: ${error.message}`)}`);
  }

  revalidatePath("/projects");
  redirect("/projects");
}

export async function upsertProjectSpecs(projectId: string, formData: FormData) {
  const supabase = await createClient();

  // auth gate
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) {
    redirect(`/support?err=${encodeURIComponent(`Auth error in upsertProjectSpecs: ${userErr.message}`)}`);
  }
  if (!userData?.user) {
    redirect("/login");
  }
  if (!projectId || projectId === "undefined") {
    redirect(`/support?err=${encodeURIComponent(`Invalid projectId in upsertProjectSpecs: ${String(projectId)}`)}`);
  }

  const app_spec_md = safeText(formData.get("app_spec_md"), 50000);
  const routesRaw = safeText(formData.get("routes_json"), 200000);
  const modelRaw = safeText(formData.get("data_model_json"), 200000);
  const apiRaw = safeText(formData.get("api_contract_json"), 200000);

  function parse(label: string, raw: string) {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      redirect(`/support?err=${encodeURIComponent(`Specs validation failed: ${label} must be valid JSON`)}`);
    }
  }

  const routes_json = parse("routes_json", routesRaw);
  const data_model_json = parse("data_model_json", modelRaw);
  const api_contract_json = parse("api_contract_json", apiRaw);

  const { error: upsertErr } = await supabase
    .from("project_specs")
    .upsert({ project_id: projectId, app_spec_md, routes_json, data_model_json, api_contract_json }, { onConflict: "project_id" });

  if (upsertErr) {
    redirect(
      `/support?err=${encodeURIComponent(
        `Specs upsert failed: ${upsertErr.message} | uid=${userData.user.id} | projectId=${projectId}`
      )}`
    );
  }

  // proof read
  const { data: proof, error: proofErr } = await supabase
    .from("project_specs")
    .select("project_id,updated_at")
    .eq("project_id", projectId)
    .maybeSingle();

  if (proofErr) {
    redirect(`/support?err=${encodeURIComponent(`Specs proof read failed: ${proofErr.message} | projectId=${projectId}`)}`);
  }
  if (!proof) {
    redirect(`/support?err=${encodeURIComponent(`Specs proof missing row after upsert (RLS/read?): projectId=${projectId}`)}`);
  }

  revalidatePath(`/project?id=${projectId}`);
  redirect(`/project?id=${projectId}#specs`);
}

export async function createJob(projectId: string, jobType: "spec_compile" | "codegen" | "fix" | "build" | "publish") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .insert({ project_id: projectId, job_type: jobType, status: "queued", input: {} })
    .select("id")
    .single();

  if (error) {
    const msg = `Create job failed: ${error.message}`;
    redirect(`/project?id=${encodeURIComponent(projectId)}&specerr=${encodeURIComponent(msg)}#specs`);
  }

  const workerSecret = process.env.JOB_WORKER_SECRET;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    if (!workerSecret) throw new Error("Missing JOB_WORKER_SECRET on server");
    if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

    const fnUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") + "/functions/v1/job-worker";
    const res = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-job-worker-secret": workerSecret,
        "Authorization": `Bearer ${anonKey}`,
        "apikey": anonKey,
      },
      body: JSON.stringify({ job_id: data.id, job_type: jobType }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      await supabase.from("jobs").update({ error: `Worker failed: HTTP ${res.status} ${txt}` }).eq("id", data.id);
    }
  } catch (e: any) {
    await supabase.from("jobs").update({ error: `Worker invoke error: ${e?.message ?? String(e)}` }).eq("id", data.id);
  }

  revalidatePath("/jobs");
  redirect(`/job?id=${encodeURIComponent(data.id)}`);
}
