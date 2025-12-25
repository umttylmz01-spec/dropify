import { createClient } from "@/lib/supabase/server";

export default async function DebugPage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  // RLS / DB testi: kendi projelerini say (anon ise hata beklenir)
  const { count, error: countErr } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Debug / Healthcheck</h1>

      <section style={{ marginTop: 16 }}>
        <h2>Auth</h2>
        <pre style={{ padding: 12, background: "#f6f6f6", overflowX: "auto" }}>
{JSON.stringify(
  {
    ok: !userErr && !!user,
    error: userErr?.message ?? null,
    user: user
      ? { id: user.id, email: user.email, last_sign_in_at: user.last_sign_in_at }
      : null,
  },
  null,
  2
)}
        </pre>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>DB / RLS</h2>
        <pre style={{ padding: 12, background: "#f6f6f6", overflowX: "auto" }}>
{JSON.stringify(
  {
    ok: !countErr,
    error: countErr?.message ?? null,
    projects_count_visible_to_user: count ?? null,
    note:
      "If logged out, expect an error. If logged in and RLS is correct, you should only see your own projects counted.",
  },
  null,
  2
)}
        </pre>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Tips</h2>
        <ul>
          <li>If Auth ok=false: check magic link callback + cookies.</li>
          <li>If DB ok=false when logged in: check RLS policies on projects.</li>
        </ul>
      </section>
    </main>
  );
}
