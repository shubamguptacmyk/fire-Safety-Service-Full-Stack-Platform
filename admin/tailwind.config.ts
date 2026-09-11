import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F0EEE7",
        ink: "#1B1F22",
        brand: { DEFAULT: "#B3261E", dark: "#9C1F18" },
        amber: { DEFAULT: "#D98E27" },
        steel: "#4B5A63",
        safe: "#2F6B4F",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Barlow'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
