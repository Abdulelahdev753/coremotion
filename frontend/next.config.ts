import type { NextConfig } from "next";

// For GitHub Pages (a project site) the app is served from /<repo>. The base
// path is injected at build time via NEXT_PUBLIC_BASE_PATH so local dev and
// other hosts stay at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // The site is often previewed from an iPhone over the local network.
  // Without this, Next blocks dev-only resources when the LAN IP is opened —
  // the page then renders but never hydrates (buttons focus yet do nothing).
  // The wildcard covers the whole subnet so DHCP lease changes don't break it.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.100.*"],
  // This app is self-contained inside the monorepo; pin Turbopack's root
  // to silence the multi-lockfile workspace-root inference warning.
  turbopack: {
    root: __dirname,
  },
  // Emit a static HTML export so the frontend can be hosted on GitHub Pages.
  output: "export",
  basePath: basePath || undefined,
  // GitHub Pages has no image optimizer; serve images as-is.
  images: { unoptimized: true },
  // Emit per-route folders with index.html so static hosts resolve clean URLs.
  trailingSlash: true,
};

export default nextConfig;
