"use client";

import { useMemo } from "react";
import { TopBar } from "@/components/TopBar";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const specPreview = useMemo(() => {
    return {
      app: { name: "Demo App", platform: "expo", locale: ["en", "tr"] },
      routes: [
        { name: "Home", path: "/" },
        { name: "Settings", path: "/settings" },
      ],
      dataModel: [{ table: "profiles", fields: ["id", "email"] }],
      apiContract: [{ name: "getProfile", method: "GET", path: "/profile" }],
    };
  }, []);

  const generate = async () => {
    alert("Generate (stub). Sonraki adım: orchestrator servisine POST /generate bağlanacak.");
  };

  return (
    <>
      <TopBar />
      <main style={{ padding: 24, maxWidth: 920 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>/project/{id}</h1>
        <p style={{ marginTop: 8 }}>Spec viewer + Generate düğmesi (stub).</p>

        <div style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Spec Preview</p>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(specPreview, null, 2)}</pre>
          </div>

          <div style={{ width: 280, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
            <p style={{ fontWeight: 600 }}>Actions</p>
            <button
              onClick={generate}
              style={{ marginTop: 12, width: "100%", border: "1px solid #333", padding: "10px 12px" }}
            >
              Generate
            </button>
            <p style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
              Bu buton ileride orchestrator → QA → fixer → security loop’u tetikleyecek.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
