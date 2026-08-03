import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev-tools badge — it sat over the reader's
  // bottom-left corner. Dev-only overlay; it never shipped in production.
  devIndicators: false,
};

export default nextConfig;
