import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Point Turbopack to the monorepo root to silence multiple lockfile warnings
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
