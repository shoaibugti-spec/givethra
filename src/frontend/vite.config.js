import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ✅ تمام ICP/caffeine سے متعلق env variables اور proxy ہٹا دیے گئے۔
// اب یہ ایک سادہ React + Vite config ہے جو Cloudflare Pages پر ڈپلے ہوگی۔

export default defineConfig({
  logLevel: "error",
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // آپ چاہیں تو true کر سکتے ہیں (پروڈکشن کے لیے)
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
      },
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  // ✅ لوکل ڈیولپمنٹ کے لیے PROXY شامل کیا گیا
  server: {
    proxy: {
      // تمام /api درخواستیں Cloudflare Worker کی طرف بھیجیں
      "/api": {
        target: "https://givethra.org", // یا آپ کا Worker URL
        changeOrigin: true,
        secure: true,
        // یہ rewrite ضروری نہیں، لیکن اگر مسائل ہوں تو استعمال کریں
        // rewrite: (path) => path,
      },
      // /uploads کی درخواستیں
      "/uploads": {
        target: "https://givethra.org",
        changeOrigin: true,
        secure: true,
      },
      // /auth کی درخواستیں
      "/auth": {
        target: "https://givethra.org",
        changeOrigin: true,
        secure: true,
      },
      // /verify کی درخواستیں
      "/verify": {
        target: "https://givethra.org",
        changeOrigin: true,
        secure: true,
      },
    },
  },

  plugins: [
    react(),
    // ✅ environment plugin کی ضرورت نہیں، Vite .env فائلیں خود پڑھ لیتا ہے۔
  ],
  resolve: {
    alias: [
      // صرف "@" alias رکھا گیا ہے (src فولڈر کے لیے)
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
