import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is often previewed from an iPhone over the local network.
  // Without this, Next blocks dev-only resources when Safari opens the LAN IP.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.100.197"],
  // This app is self-contained inside the monorepo; pin Turbopack's root
  // to silence the multi-lockfile workspace-root inference warning.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
