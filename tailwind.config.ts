import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        virgil: {
          bg: "var(--virgil-bg)",
          "bg-alt": "var(--virgil-bg-alt)",
          blush: "var(--virgil-blush)",
          border: "var(--virgil-border)",
          "border-soft": "var(--virgil-border-soft)",
          accent: "var(--virgil-accent)",
          "accent-warm": "var(--virgil-accent-warm)",
          glow: "var(--virgil-glow)",
          pale: "var(--virgil-pale)",
          text: "var(--virgil-text)",
          "text-muted": "var(--virgil-text-muted)",
          success: "var(--virgil-success)",
          warning: "var(--virgil-warning)",
          danger: "var(--virgil-danger)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "12px",
        button: "8px",
        badge: "6px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(104, 72, 232, 0.08)",
        glow: "0 0 20px rgba(104, 72, 232, 0.15)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "bounce-dot": "bounce-dot 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [],
};

export default config;
