import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev on 5174 so the coach tool (5173) and this page can run side by side.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
});
