"use client";

import { TopBar } from "@/components/TopBar";

export default function NewProjectPage() {
  return (
    <>
      <TopBar />
      <main style={{ padding: 24, maxWidth: 820 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>/new</h1>
        <p style={{ marginTop: 8 }}>
          Template picker + questionnaire (stub). Sonraki adım: spec dosyalarını üretip /project/[id]'ye yazacağız.
        </p>

        <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <p style={{ fontWeight: 600 }}>Template</p>
          <ul style={{ marginTop: 8, lineHeight: 1.8 }}>
            <li>• Landing + Auth</li>
            <li>• E-commerce starter</li>
            <li>• Booking / Calendar</li>
          </ul>
          <button style={{ marginTop: 12, border: "1px solid #333", padding: "8px 12px" }}>
            Create (stub)
          </button>
        </div>
      </main>
    </>
  );
}
