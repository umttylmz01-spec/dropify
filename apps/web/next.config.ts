import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
console.log("NEXT_PUBLIC_SUPABASE_URL at build:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY at build:", (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").slice(0, 12) + "...");
