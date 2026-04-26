import type { Language } from "../types";
import { useLang } from "../i18n";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "uk", label: "UK" },
  { code: "ru", label: "RU" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            lang === code
              ? "text-primary bg-border"
              : "text-muted hover:text-primary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
