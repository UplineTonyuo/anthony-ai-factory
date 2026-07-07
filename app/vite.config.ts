import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the built app can be served from any path (root or subpath).
  base: "./",
  server: {
    // Dev convenience only: forwards same-origin /api calls to the standalone
    // Node API boundary (server/). The server, not this proxy, is the API.
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
