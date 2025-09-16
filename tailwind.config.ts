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
        glass: "rgba(255,255,255,0.3)",
        ink: "#0b132b"
      },
      boxShadow: {
        glass: "0 8px 32px rgba(31, 38, 135, 0.37)"
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
};
export default config;
