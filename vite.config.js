import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isWeb = mode === "web";
  const isElectron = mode === "electron"; // 有兩種狀態

  return {
    base: isWeb ? "/你的-repo名稱/" : "./",
    build: {
      outDir: isWeb ? "docs" : "dist",
      emptyOutDir: true,
    },
    server: { port: 5173, strictPort: true },
  };
});
