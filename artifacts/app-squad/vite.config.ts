import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  define: {
    "process.env.STRIPE_PRICE_ESSENTIALS": JSON.stringify(process.env.STRIPE_PRICE_ESSENTIALS),
    "process.env.STRIPE_PRICE_ACCELERATOR": JSON.stringify(process.env.STRIPE_PRICE_ACCELERATOR),
    "process.env.STRIPE_PRICE_EMPIRE": JSON.stringify(process.env.STRIPE_PRICE_EMPIRE),
    "process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY": JSON.stringify(process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY),
    "process.env.STRIPE_PRICE_ESSENTIALS_SETUP": JSON.stringify(process.env.STRIPE_PRICE_ESSENTIALS_SETUP),
    "process.env.STRIPE_PRICE_ACCELERATOR_MONTHLY": JSON.stringify(process.env.STRIPE_PRICE_ACCELERATOR_MONTHLY),
    "process.env.STRIPE_PRICE_ACCELERATOR_SETUP": JSON.stringify(process.env.STRIPE_PRICE_ACCELERATOR_SETUP),
    "process.env.STRIPE_PRICE_EMPIRE_MONTHLY": JSON.stringify(process.env.STRIPE_PRICE_EMPIRE_MONTHLY),
    "process.env.STRIPE_PRICE_EMPIRE_SETUP": JSON.stringify(process.env.STRIPE_PRICE_EMPIRE_SETUP),
  },
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    // Local dev only: serve over https with a self-signed cert. Zoho Sign's
    // embedded signing iframe requires the embedding page to be an https
    // origin. Replit provides TLS at its proxy, so skip it there.
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID === undefined && process.env.VITE_SSL === "true"
      ? [(await import("@vitejs/plugin-basic-ssl")).default()]
      : []),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_SERVER_PORT || "8080"}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
