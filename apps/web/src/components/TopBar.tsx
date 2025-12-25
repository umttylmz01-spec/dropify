"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TopBar() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onLogout() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header style={{ padding: 12, borderBottom: "1px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/projects" style={{ textDecoration: "none" }}>Projects</Link>
          <Link href="/new" style={{ textDecoration: "none" }}>New</Link>
          <Link href="/debug" style={{ textDecoration: "none" }}>Debug</Link>
          <Link href="/support" style={{ textDecoration: "none" }}>Support</Link>
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ opacity: 0.8 }}>{email ?? "Not signed in"}</span>
          <button
            onClick={onLogout}
            disabled={!email || busy}
            style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}
          >
            {busy ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
