import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0D6E6E",
          foreground: "#FFFFFF"
        },
        accent: {
          DEFAULT: "#FF6B6B",
          foreground: "#111111"
        },
        gold: "#F5A623",
        optical: {
          ink: "#111111",
          text: "#1A1A1A",
          muted: "#666666",
          shell: "#F9F8F6",
          fog: "#F2F2F0",
          teal: "#0D6E6E",
          blue: "#1B4FFF",
          coral: "#FF6B6B",
          gold: "#F5A623"
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF"
        },
        muted: {
          DEFAULT: "#F2F2F0",
          foreground: "#666666"
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 60px rgba(17, 17, 17, 0.08)",
        lift: "0 18px 40px rgba(13, 110, 110, 0.16)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 700ms ease-out both"
      }
    }
  },
  plugins: [animate]
};

export default config;
