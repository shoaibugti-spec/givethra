import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// 🔴 تمام ICP/caffeine سے متعلق env variables اور proxy ہٹا دیے گئے۔
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
  // 🔴 لوکل ڈیولپمنٹ کے لیے proxy اگر چاہیں تو ڈال سکتے ہیں،
  // لیکن اب یہ worker کو target کرے گا (مثال کے طور پر):
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "https://givethra.shoaibugti.workers.dev",
  //       changeOrigin: true,
  //     },
  //   },
  // },
  // اگر آپ کو لوکل ڈیولپمنٹ میں proxy کی ضرورت نہیں تو اسے کومنٹ کر دیں۔
  // میں نے اسے ہٹا دیا ہے تاکہ کوئی الجھن نہ ہو۔

  plugins: [
    react(),
    // 🔴 environment plugin کی ضرورت نہیں، Vite .env فائلیں خود پڑھ لیتا ہے۔
    // اگر آپ کو کوئی خاص env variable چاہیے تو اسے .env میں ڈالیں۔
  ],
  resolve: {
    alias: [
      // صرف "@" alias رکھا گیا ہے (src فولڈر کے لیے)
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      // 🔴 "declarations" alias ہٹا دیا گیا (یہ ICP کا تھا)
    ],
    // 🔴 dedupe بھی ہٹا دیا (یہ @icp-sdk/core کے لیے تھا)
  },
});
