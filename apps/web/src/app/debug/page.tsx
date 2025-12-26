import { createClient } from "@/lib/supabase/server";

export default async function DebugPage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();

  let dbOk = false;
  let dbErr: string | null = null;
  let count: number | null = null;

  if (userData?.user) {
    const res = await supabase.from("projects").select("id", { count: "exact", head: true });
    if (res.error) {
      dbOk = false;
      dbErr = res.error.message;
    } else {
      dbOk = true;
      count = res.count ?? null;
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Debug</h1>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div><b>Auth ok:</b> {String(!!userData?.user)}</div>
        <div><b>User error:</b> {userErr ? userErr.message : "-"}</div>
        <div><b>Email:</b> {userData?.user?.email ?? "-"}</div>
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div><b>DB ok:</b> {userData?.user ? String(dbOk) : "(login required)"}</div>
        <div><b>DB error:</b> {dbErr ?? "-"}</div>
        <div><b>projects count (visible to user):</b> {count ?? "-"}</div>
      </div>
    </main>
  );
}
