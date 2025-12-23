"use client";

import { TopBar } from "@/components/TopBar";

export default function SupportPage() {
  return (
    <>
      <TopBar />
      <main style={{ padding: 24, maxWidth: 820 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>/support</h1>
        <p style={{ marginTop: 8 }}>
          Chatbot placeholder. Sonraki adım: Supabase üzerinden ticket tablosu + basic UI.
        </p>

        <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <p style={{ fontWeight: 600 }}>Support Chat (stub)</p>
          <p style={{ marginTop: 8, opacity: 0.8 }}>“Merhaba, nasıl yardımcı olabilirim?”</p>
        </div>
      </main>
    </>
  );
}
