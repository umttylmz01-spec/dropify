"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SupportPage() {
  const sp = useSearchParams();
  const [copied, setCopied] = useState(false);

  const err = sp.get("err") ?? "Unknown error";
  const error_code = sp.get("error_code");
  const error_description = sp.get("error_description");

  const report = useMemo(() => {
    const lines: string[] = [];
    lines.push("DROPIFY SUPPORT REPORT");
    lines.push(`time: ${new Date().toISOString()}`);
    lines.push(`url: ${typeof window !== "undefined" ? window.location.href : ""}`);
    lines.push("");
    lines.push("error:");
    lines.push(err);

    if (error_code) lines.push(`error_code: ${error_code}`);
    if (error_description) lines.push(`error_description: ${error_description}`);

    lines.push("");
    lines.push("next steps:");
    lines.push("- Open /debug and screenshot Auth + DB sections");
    lines.push("- If auth issues: verify callback, cookies, redirect URLs");
    lines.push("- If DB issues: verify RLS policies");

    return lines.join("\n");
  }, [err, error_code, error_description]);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900 }}>
      <h1>Support</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        If something broke, copy the report below and send it (with a screenshot of /debug).
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <a href="/debug" style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none" }}>
          Open Debug
        </a>

        <button
          onClick={copyReport}
          style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}
        >
          {copied ? "Copied" : "Copy report"}
        </button>

        <a href="/" style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none" }}>
          Home
        </a>
      </div>

      <pre style={{ marginTop: 16, padding: 12, background: "#f6f6f6", borderRadius: 10, overflowX: "auto" }}>
        {report}
      </pre>
    </main>
  );
}
