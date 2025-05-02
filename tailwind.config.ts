
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(240 6% 10%)",
        input: "hsl(240 6% 10%)",
        ring: "hsl(240 5% 26%)",
        background: "hsl(240 10% 4%)",
        foreground: "hsl(0 0% 95%)",
        primary: {
          DEFAULT: "hsl(270 65% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(240 4% 16%)",
          foreground: "hsl(0 0% 85%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(240 4% 16%)",
          foreground: "hsl(240 5% 65%)",
        },
        accent: {
          DEFAULT: "hsl(240 4% 16%)",
          foreground: "hsl(240 5% 85%)",
        },
        popover: {
          DEFAULT: "hsl(240 10% 4%)",
          foreground: "hsl(0 0% 95%)",
        },
        card: {
          DEFAULT: "hsl(240 10% 4%)",
          foreground: "hsl(0 0% 95%)",
        },
        novel: {
          purple: "rgb(139, 92, 246)",
          lavender: "rgb(196, 181, 253)",
          orange: "rgb(249, 115, 22)",
          light: "rgb(248, 250, 252)",
          dark: "rgb(30, 41, 59)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in 0.4s ease-out forwards",
        "fade-out-down": "fade-out 0.4s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
