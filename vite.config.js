import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isWeb = mode === "web";
  const isElectron = mode === "electron"; // 有兩種狀態

  return {
    plugins: [react(), tailwindcss()],
    base: isWeb ? "/oqc-exception-form/" : "./",
    build: {
      outDir: isWeb ? "docs" : "dist",
      emptyOutDir: true,
    },
    server: { port: 5173, strictPort: true },
  };
});
