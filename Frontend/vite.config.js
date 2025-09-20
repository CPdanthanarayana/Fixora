import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        theme: {
          extend: {
            fontFamily: {
              sans: ["Inter", "sans-serif"],
            },
            colors: {
              primary: {
                50: "#eef2ff",
                100: "#e0e7ff",
                500: "#6366f1",
                600: "#4f46e5",
                700: "#4338ca",
              },
              secondary: {
                100: "#fce7f3",
                500: "#ec4899",
                600: "#db2777",
              },
              neutral: {
                100: "#f9fafb",
                200: "#f3f4f6",
                800: "#1f2937",
                900: "#111827",
              },
            },
          },
        },
      },
    }),
  ],
});
