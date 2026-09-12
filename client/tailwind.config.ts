import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C", // Main primary
          800: "#991B1B",
          900: "#7F1D1D",
          DEFAULT: "#B91C1C",
        },
        secondary: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
        },
        accent: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
        },
        dark: {
          DEFAULT: "#111827",
          secondary: "#1F2937",
          card: "#1F2937",
        },
        surface: "#F8FAFC",
        muted: "#64748B",
        border: "#E2E8F0",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",

        // Compatibility aliases mapped to the new professional palette
        brand: {
          DEFAULT: "#B91C1C",
          dark: "#991B1B",
          light: "#DC2626",
        },
        ink: "#111827",
        steel: "#64748B",
        paper: "#F8FAFC",
        amber: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Manrope'", "'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
        hover: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        elevated: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
} satisfies Config;
