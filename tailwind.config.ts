import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          bg: "#f7f9fa",
          primary: "#0f6e5f",
          primaryDark: "#0b5347",
          text: "#1a2027",
          muted: "#5c6b73"
        }
      }
    }
  },
  plugins: []
};

export default config;
