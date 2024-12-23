import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert"; // Import mkcert plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()], // Add mkcert plugin
  server: {
    host: "0.0.0.0",
    https: true, // Enable HTTPS
  },
});
