import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",    // Clean blue
        secondary: "#64748b",   // Gray
        success: "#10b981",     // Green
        danger: "#ef4444",      // Red
        background: "#f9fafb",  // Off-white
        border: "#e5e7eb",      // Light gray
      },
    },
  },
  plugins: [],
};
export default config;