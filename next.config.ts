import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OneDrive can lock `.next` during sync. Keep the normal output by default,
  // while allowing local validation to redirect generated files to a writable
  // directory with `NEXT_DIST_DIR`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
