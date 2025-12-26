"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SupportPage() {
  const sp = useSearchParams();
  const err = sp.get("err") ?? "No error message provided.";

  const [clientTime, setClientTime] = useState<string>("(loading)");
  const [clientUrl, setClientUrl] = useState<string>("(loading)");

  useEffect(() => {
    setClientTime(new Date().toISOString());
    setClientUrl(window.location.href);
  }, []);

  const report = useMemo(() => {
    return [
      "DROPIFY — SUPPORT REPORT",
      `time_utc: ${clientTime}`,
      `url: ${clientUrl}`,
      `err: ${err}`,
      "",
      "Next steps:",
      "1) Open /debug and verify Auth/DB ok.",
      "2) If this is a project page redirect, copy the full error text above.",
    ].join("\n");
  }, [clientTime, clientUrl, err]);

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    alert("Copied.");
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Support</h1>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>Error</div>
        <div style={{ whiteSpace: "pre-wrap" }}>{err}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={copyReport} style={{ padding: "8px 12px" }}>
          Copy report
        </button>
        <a href="/debug" style={{ padding: "8px 12px", display: "inline-block" }}>
          Open /debug
        </a>
        <a href="/projects" style={{ padding: "8px 12px", display: "inline-block" }}>
          Back to /projects
        </a>
      </div>

      <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
        {report}
      </pre>
    </main>
  );
}
