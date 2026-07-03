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
          50: "hsl(210 20% 98%)",
          100: "hsl(210 17% 95%)",
          200: "hsl(210 14% 89%)",
          300: "hsl(210 12% 80%)",
          400: "hsl(210 10% 62%)",
          500: "hsl(210 9% 48%)",
          600: "hsl(210 10% 36%)",
          700: "hsl(210 12% 24%)",
          800: "hsl(210 14% 16%)",
          900: "hsl(210 16% 10%)",
          950: "hsl(210 20% 6%)",
        },
        accent: {
          DEFAULT: "hsl(160 84% 39%)",
          hover: "hsl(160 72% 34%)",
          active: "hsl(160 68% 28%)",
          subtle: "hsl(160 60% 95%)",
        },
        warm: {
          DEFAULT: "hsl(18 48% 54%)",
          hover: "hsl(18 44% 48%)",
          subtle: "hsl(18 50% 92%)",
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
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
