/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--c-bg)",
        surface: "var(--c-surface)",
        border: "var(--c-border)",
        accent: "var(--c-accent)",
        "accent-dim": "var(--c-accent-dim)",
        clean: "var(--c-clean)",
        "clean-text": "var(--c-clean-text)",
        relapse: "var(--c-relapse)",
        "relapse-text": "var(--c-relapse-text)",
        primary: "var(--c-primary)",
        muted: "var(--c-muted)",
        subtle: "var(--c-subtle)",
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
