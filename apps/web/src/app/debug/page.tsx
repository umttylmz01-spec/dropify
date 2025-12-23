export default function DebugPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Debug env</h1>
      <pre>{JSON.stringify({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonPrefix: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").slice(0, 12) + "..."
      }, null, 2)}</pre>
    </main>
  );
}
