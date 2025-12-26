import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";
function jsonObjectLength(v: any): number {
  if (!v || typeof v !== "object" || Array.isArray(v)) return 0;
  return Object.keys(v).length;
}

function firstRouteName(routes: any): string {
  const keys = routes && typeof routes === "object" ? Object.keys(routes) : [];
  return keys[0] || "home";
}

function makeExpoRouterPlan(projectId: string, routes: any, model: any) {
  const routeKeys = routes && typeof routes === "object" ? Object.keys(routes) : [];
  const modelKeys = model && typeof model === "object" ? Object.keys(model) : [];
  const home = firstRouteName(routes);

  // Minimal but concrete scaffold plan (MVP)
  const files = [
    { path: "app/_layout.tsx", purpose: "Expo Router root layout + Stack" },
    { path: `app/index.tsx`, purpose: "Entry route (home screen)" },
    { path: `app/${home}.tsx`, purpose: "Home screen (if not index)" },
    { path: "src/lib/types.ts", purpose: "Model types derived from data_model.json (placeholder)" },
    { path: "src/lib/storage.ts", purpose: "Local storage placeholder" },
    { path: "src/lib/api.ts", purpose: "API contract placeholder" },
    { path: "src/components/ThemedText.tsx", purpose: "Sample UI component" },
    { path: "app/(auth)/login.tsx", purpose: "Auth stub screen" },
    { path: "app/(auth)/_layout.tsx", purpose: "Auth stack layout" },
    { path: "app/(tabs)/_layout.tsx", purpose: "Tabs layout (optional)" },
    { path: "README.md", purpose: "Run instructions" },
  ];

  const commands = [
    "npx create-expo-app@latest app --template blank-typescript",
    "cd app",
    "npx expo install expo-router react-native-screens react-native-safe-area-context",
    "npx expo install expo-linking expo-constants",
    "npx expo start",
  ];

  const notes = [
    "This is a plan-only output (no files generated yet). Next iteration will materialize files or generate a zip artifact.",
    `Detected routes: ${routeKeys.length} | model keys: ${modelKeys.length}`,
  ];

  return {
    framework: "expo-managed",
    navigation: "expo-router",
    detected: { routes: routeKeys, models: modelKeys },
    files,
    commands,
    notes,
    target_paths_hint: {
      repo_root: "app/",
      router_dir: "app/",
      shared_src: "app/src/",
    },
    version: "codegen-plan@v1",
  };
}
function makeScaffoldFiles(projectId: string) {
  return [
    {
      path: "app/_layout.tsx",
      content: `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
`,
    },
    {
      path: "app/index.tsx",
      content: `import { View, Text } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Dropify scaffold is alive.</Text>
    </View>
  );
}
`,
    },
    {
      path: "app/(auth)/_layout.tsx",
      content: `import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
`,
    },
    {
      path: "app/(auth)/login.tsx",
      content: `import { View, Text } from "react-native";

export default function Login() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Login (stub)</Text>
    </View>
  );
}
`,
    },
    {
      path: "README.md",
      content: `# Dropify Mobile (Generated)

This is a minimal generated scaffold artifact for project: ${projectId}

## Run
- pnpm i
- cd apps/mobile
- npx expo start
`,
    },
  ];
}

async function buildZipArtifact(files: { path: string; content: string }[]) {
  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.content);
  return await zip.generateAsync({ type: "uint8array" });
}
Deno.serve(async (req) => {
  try {
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!url || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(url, serviceKey);

    const body = await req.json().catch(() => ({}));
    const job_id = body?.job_id as string | undefined;
    const job_type = body?.job_type as string | undefined;

    if (!job_id) {
      return new Response(JSON.stringify({ error: "Missing job_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Load job -> project_id
    const jobRes = await supabase.from("jobs").select("id, project_id, job_type").eq("id", job_id).maybeSingle();
    if (jobRes.error) throw new Error(`jobs read failed: ${jobRes.error.message}`);
    if (!jobRes.data?.project_id) throw new Error(`job not found or missing project_id: ${job_id}`);

    const project_id = jobRes.data.project_id as string;

    // Load specs
    const specsRes = await supabase
      .from("project_specs")
      .select("routes_json,data_model_json,api_contract_json,app_spec_md,updated_at")
      .eq("project_id", project_id)
      .maybeSingle();

    if (specsRes.error) throw new Error(`project_specs read failed: ${specsRes.error.message}`);

    const routes = specsRes.data?.routes_json ?? {};
    const model = specsRes.data?.data_model_json ?? {};

    const routes_count = jsonObjectLength(routes);
    const data_model_keys = jsonObjectLength(model);

    const output: any = {
      worker: "job-worker@v5",
      job_type: job_type ?? jobRes.data.job_type,
      summary: { routes_count, data_model_keys },
      warnings: [],
      processed_at_utc: new Date().toISOString(),
    };

    // Attach codegen plan for codegen jobs
    if ((job_type ?? jobRes.data.job_type) === "codegen") {
      output.codegen_plan = makeExpoRouterPlan(project_id, routes, model);
      // Materialize minimal scaffold as a downloadable ZIP artifact (MVP)
      const files = makeScaffoldFiles(project_id);
      const zipBytes = await buildZipArtifact(files);

      const bucket = "dropify-artifacts";
      const objectPath = `${project_id}/${job_id}/artifact.zip`;

      const uploadRes = await supabase.storage
        .from(bucket)
        .upload(objectPath, new Blob([zipBytes], { type: "application/zip" }), {
          contentType: "application/zip",
          upsert: true,
        });

      if (uploadRes.error) {
        output.warnings.push(`artifact upload failed: ${uploadRes.error.message}`);
      } else {
        output.artifact = { bucket, path: objectPath };

        // Create a signed URL (service-role) so UI can download without storage auth headaches
        const signed2 = await supabase.storage.from(bucket).createSignedUrl(objectPath, 60 * 60); // 60 minutes
        if (signed2.error) {
          output.warnings.push(`artifact signed url failed: ${signed2.error.message}`);
        } else {
          output.artifact_signed_url = signed2.data?.signedUrl ?? null;
        }

        await supabase.from("jobs").update({ artifact_bucket: bucket, artifact_path: objectPath }).eq("id", job_id);      }
      output.next_tasks = [
        "Materialize scaffold files in a dedicated repo folder (app/) inside this monorepo OR generate a downloadable zip",
        "Generate app/_layout.tsx + app/index.tsx content from routes.json",
        "Generate types.ts from data_model.json",
        "Add lint/typecheck baseline and a smoke test",
      ];
    } else {
      output.next_tasks = ["No-op for this job type (only codegen plan implemented)."];
    }

    // Update job
    const upd = await supabase
      .from("jobs")
      .update({ status: "succeeded", output, error: null, updated_at: new Date().toISOString() })
      .eq("id", job_id);

    if (upd.error) throw new Error(`jobs update failed: ${upd.error.message}`);

    return new Response(JSON.stringify({ ok: true, output }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});



