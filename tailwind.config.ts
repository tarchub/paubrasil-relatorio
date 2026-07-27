import type { Config } from "tailwindcss";

/**
 * Design system — premium, limpo e profissional.
 * Paleta: preto, cinza escuro, bege, dourado discreto, branco para contraste.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fundo / superfícies
        ink: {
          DEFAULT: "#0a0a0b", // preto quase absoluto
          800: "#111113",
          700: "#17171a",
          600: "#1e1e22",
          500: "#26262b",
        },
        // Bege
        sand: {
          DEFAULT: "#e8e1d4",
          light: "#f4efe6",
          muted: "#c9c0af",
          dark: "#a99f8a",
        },
        // Dourado discreto
        gold: {
          DEFAULT: "#c9a24b",
          soft: "#d9bd77",
          deep: "#a9822f",
        },
        line: "rgba(232,225,212,0.10)",
        line2: "rgba(232,225,212,0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
