import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/types/src/**/*.ts"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f2e8",
        ink: "#1e1a17",
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#dd6b20",
          600: "#c05621",
          700: "#9c4221"
        },
        teal: {
          100: "#d8f3ef",
          500: "#1f766e",
          700: "#15554f"
        },
        plum: {
          100: "#f3e8ff",
          500: "#6b46c1"
        }
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Manrope", "Avenir Next", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        panel: "0 24px 80px rgba(17, 12, 7, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(221,107,32,0.12), transparent 32%), linear-gradient(135deg, rgba(21,85,79,0.08), transparent 50%)"
      }
    }
  },
  plugins: []
};

export default config;
