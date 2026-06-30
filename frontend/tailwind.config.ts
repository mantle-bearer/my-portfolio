import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        line: "#d9dee7",
        panel: "#f8fafc",
        accent: "#0f766e"
      }
    }
  },
  plugins: []
} satisfies Config;

