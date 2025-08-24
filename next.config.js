/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import WithPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const withPWA = WithPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "service-worker.js",
});

/** @type {import('next').NextConfig} */
// @ts-ignore
const config = withPWA({
  reactStrictMode: true,

  // ✅ Required for GitHub Pages
  output: "export",

  // ✅ Disable Next.js image optimization (not supported on GitHub Pages)
  images: {
    unoptimized: true,
  },

  // ✅ Use repo name as asset prefix when deployed on GH Pages
  assetPrefix: isProd ? "/portfolio/" : "",

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
});

export default config;
