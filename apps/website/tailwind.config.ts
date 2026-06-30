import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: '#1A3C34',
          light: '#2A5C50',
          lighter: '#3A7C68',
        },
        clay: {
          DEFAULT: '#C4774B',
          hover: '#B06840',
          light: '#F0E0D4',
        },
        bg: '#F6F4EF',
        surface: '#FFFFFF',
        ink: '#1C1C1C',
        muted: '#8C847C',
        border: '#E4DFD6',
        'ink-light': '#F0EBE4',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0', transform: 'translateY(8px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    slideIn: {
      '0%': { opacity: '0', transform: 'translateY(-4px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
  animation: {
    'fade-in': 'fadeIn 0.4s ease-out forwards',
    'slide-in': 'slideIn 0.25s ease-out forwards',
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
};
export default config;
