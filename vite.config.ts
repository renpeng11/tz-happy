import { defineConfig, type UserConfigExport } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

export default ({ mode }: { mode: string }): UserConfigExport => {
  const env = loadEnv(mode, process.cwd(), "VITE");

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL?.replace("/api", "") || "https://pre.tz-strategy-vote.pages.dev",
          changeOrigin: true,
        },
      },
    },
  });
};