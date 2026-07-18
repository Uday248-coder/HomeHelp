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
        base: ["0.9375rem", { lineHeight: "1.55", letterSpacing: "-0.005em" }],
        lg: ["1.0625rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.015em" }],
        "2xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.018em" }],
        "3xl": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.022em" }],
        "4xl": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.026em" }],
        "5xl": ["3rem", { lineHeight: "1.06", letterSpacing: "-0.028em" }],
        "6xl": ["3.75rem", { lineHeight: "1.04", letterSpacing: "-0.032em" }],
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
          subtle: "hsl(var(--accent-subtle))",
        },
        warm: {
          DEFAULT: "hsl(var(--warm))",
          hover: "hsl(var(--warm-hover))",
          subtle: "hsl(var(--warm-subtle))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          secondary: "hsl(var(--surface-secondary))",
          tertiary: "hsl(var(--surface-tertiary))",
          inverse: "hsl(var(--surface-inverse))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
          tertiary: "hsl(var(--foreground-tertiary))",
          "on-accent": "hsl(var(--foreground-on-accent))",
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
        "3xl": "var(--radius-3xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        accent: "var(--shadow-accent)",
        warm: "var(--shadow-warm)",
      },
      transitionTimingFunction: {
        spring: "var(--ease-spring)",
        "out-smooth": "var(--ease-out)",
      },
      transitionDuration: {
        micro: "var(--dur-micro)",
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        entry: "var(--dur-entry)",
        scene: "var(--dur-scene)",
      },
      keyframes: {
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "overlay-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in var(--dur-base) var(--ease-spring) forwards",
        "overlay-in": "overlay-in var(--dur-base) var(--ease-out) forwards",
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
