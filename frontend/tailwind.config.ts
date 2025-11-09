import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8f3ff",
          100: "#cfe4ff",
          200: "#a3ceff",
          300: "#74b3ff",
          400: "#4e98ff",
          500: "#2a7fff",
          600: "#0f63e6",
          700: "#084ec4",
          800: "#0a419f",
          900: "#0e397f",
        },
        accent: {
          50: "#fff3e6",
          100: "#ffe1c0",
          200: "#ffcb94",
          300: "#ffb25f",
          400: "#ff9c33",
          500: "#ff8619",
          600: "#f06d0a",
          700: "#c55508",
          800: "#9b440d",
          900: "#7f3810",
        },
      },
      fontFamily: {
        display: ["var(--font-manrope)", "Inter", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
      },
    },
  },
  plugins: [forms],
};
export default config;
