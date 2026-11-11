import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stocky: {
          bg: "#0b0f19",
          card: "#151c2c",
          border: "#222d42",
          inner: "#1c253b",
          sidebar: "#111622",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
