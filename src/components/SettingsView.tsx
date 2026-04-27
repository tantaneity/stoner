import { motion } from "framer-motion";
import type { Language, Theme } from "../types";
import { useLang } from "../i18n";

interface ThemeOption {
  value: Theme;
  label: keyof { themeDark: unknown; themeDim: unknown; themeLight: unknown };
  bg: string;
  surface: string;
  dot: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: "dark", label: "themeDark", bg: "#0a0a0a", surface: "#141414", dot: "#6366f1" },
  { value: "dim", label: "themeDim", bg: "#111827", surface: "#1f2937", dot: "#6366f1" },
  { value: "light", label: "themeLight", bg: "#f8fafc", surface: "#ffffff", dot: "#4f46e5" },
];

const LANG_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "uk", label: "Українська" },
  { code: "ru", label: "Русский" },
];

export default function SettingsView() {
  const { t, lang, setLang, theme, setTheme } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-8 pb-24"
    >
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
          {t.theme}
        </h2>
        <div className="flex flex-col gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                theme === opt.value
                  ? "border-accent stone"
                  : "border-border stone hover:border-subtle"
              }`}
            >
              <div
                className="w-9 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: opt.bg, border: `1px solid ${opt.surface}` }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: opt.dot }}
                />
                <div
                  className="w-3 h-1 rounded-sm ml-1"
                  style={{ background: opt.surface }}
                />
              </div>
              <span className="text-sm text-primary flex-1 text-left">
                {t[opt.label]}
              </span>
              {theme === opt.value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent shrink-0">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
          {t.language}
        </h2>
        <div className="flex flex-col gap-2">
          {LANG_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                lang === code
                  ? "border-accent stone"
                  : "border-border stone hover:border-subtle"
              }`}
            >
              <span className="text-xs font-bold text-muted w-6 shrink-0">{code.toUpperCase()}</span>
              <span className="text-sm text-primary flex-1 text-left">{label}</span>
              {lang === code && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent shrink-0">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
