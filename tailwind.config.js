/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#141414",
        border: "#222222",
        accent: "#6366f1",
        "accent-dim": "#4f46e5",
        clean: "#14532d",
        "clean-text": "#86efac",
        relapse: "#7f1d1d",
        "relapse-text": "#fca5a5",
        primary: "#f5f5f5",
        muted: "#6b7280",
        subtle: "#374151",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
