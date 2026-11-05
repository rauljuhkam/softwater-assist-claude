import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          50: "#eff4ff",
          100: "#dbe6fe",
          200: "#bfd4fe",
          300: "#93b7fd",
          400: "#6090fa",
          500: "#3b6cf4",
          600: "#2a4fe8",
          700: "#233dd4",
          800: "#2233ab",
          900: "#212f87",
        },
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
