"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function TopBar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header style={{ padding: 16, borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <a href="/" style={{ textDecoration: "underline" }}>Home</a>
        <a href="/new" style={{ textDecoration: "underline" }}>/new</a>
        <a href="/project/demo" style={{ textDecoration: "underline" }}>/project/demo</a>
        <a href="/support" style={{ textDecoration: "underline" }}>/support</a>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>
          {email ? `Session: ${email}` : "Session: (none)"}
        </span>
        {email ? (
          <button onClick={logout} style={{ border: "1px solid #333", padding: "6px 10px" }}>Logout</button>
        ) : (
          <a href="/login" style={{ textDecoration: "underline" }}>/login</a>
        )}
      </div>
    </header>
  );
}
