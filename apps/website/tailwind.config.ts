import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0" }],
        sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "0" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.015em" }],
        "2xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "5xl": ["3rem", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "6xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      colors: {
        neutral: {
          50: "hsl(var(--neutral-50))",
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--neutral-700))",
          800: "hsl(var(--neutral-800))",
          900: "hsl(var(--neutral-900))",
          950: "hsl(var(--neutral-950))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          hover: "hsl(var(--accent-hover))",
          active: "hsl(var(--accent-active))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          secondary: "hsl(var(--surface-secondary))",
          tertiary: "hsl(var(--surface-tertiary))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
          tertiary: "hsl(var(--foreground-tertiary))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          hover: "hsl(var(--border-hover))",
        },
        background: "hsl(var(--background))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height, auto)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height, auto)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
