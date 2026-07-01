import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "da8d-2401-4900-5acc-b9b7-b9a9-ec4f-7138-5525.ngrok-free.app",
    ],
  },
});