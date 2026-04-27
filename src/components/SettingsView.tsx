import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { Language, Theme } from "../types";
import { useLang } from "../i18n";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { hasPin, clearPin } from "./LockScreen";
import PinSetupModal from "./PinSetupModal";

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

const AUTO_LOCK_OPTIONS = [
  { value: "off", labelKey: "autoLockOff" as const },
  { value: "1m", labelKey: "autoLock1m" as const },
  { value: "5m", labelKey: "autoLock5m" as const },
  { value: "15m", labelKey: "autoLock15m" as const },
];

interface SettingsViewProps {
  onExportJson: () => string;
  onExportCsv: () => string;
}

export default function SettingsView({ onExportJson, onExportCsv }: SettingsViewProps) {
  const { t, lang, setLang, theme, setTheme } = useLang();
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(
    () => localStorage.getItem("notifyUnlogged") === "true"
  );

  // Privacy state
  const [pinSet, setPinSet] = useState(() => hasPin());
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [autoLock, setAutoLock] = useState(
    () => localStorage.getItem("autoLock") ?? "off"
  );
  const [appTitle, setAppTitle] = useState(
    () => localStorage.getItem("appTitle") ?? ""
  );
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (type: "json" | "csv") => {
    const content = type === "json" ? onExportJson() : onExportCsv();
    const ext = type === "json" ? "json" : "csv";
    const filename = `stoner-export-${new Date().toISOString().split("T")[0]}.${ext}`;
    try {
      const path = await save({
        defaultPath: filename,
        filters: [{ name: type.toUpperCase(), extensions: [ext] }],
      });
      if (path) {
        await writeTextFile(path, content);
        setExportMsg(t.exportDone);
        setTimeout(() => setExportMsg(null), 2500);
      }
    } catch {
      // user cancelled
    }
  };

  const handleNotifyToggle = async () => {
    if (!notifyEnabled) {
      let granted = await isPermissionGranted();
      if (!granted) {
        const perm = await requestPermission();
        granted = perm === "granted";
      }
      if (granted) {
        setNotifyEnabled(true);
        localStorage.setItem("notifyUnlogged", "true");
        sendNotification({ title: "Stoner", body: "Notifications enabled" });
      }
    } else {
      setNotifyEnabled(false);
      localStorage.setItem("notifyUnlogged", "false");
    }
  };

  const handleRemovePin = () => {
    clearPin();
    localStorage.removeItem("autoLock");
    setAutoLock("off");
    setPinSet(false);
  };

  const handleAutoLockChange = (val: string) => {
    setAutoLock(val);
    localStorage.setItem("autoLock", val);
  };

  const handleApplyTitle = async () => {
    const title = appTitle.trim() || "Stoner";
    localStorage.setItem("appTitle", appTitle.trim());
    await getCurrentWindow().setTitle(title);
    titleInputRef.current?.blur();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-8 pb-24"
    >
      {/* Theme */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">{t.theme}</h2>
        <div className="flex flex-col gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                theme === opt.value ? "border-accent stone" : "border-border stone hover:border-subtle"
              }`}
            >
              <div
                className="w-9 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: opt.bg, border: `1px solid ${opt.surface}` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: opt.dot }} />
                <div className="w-3 h-1 rounded-sm ml-1" style={{ background: opt.surface }} />
              </div>
              <span className="text-sm text-primary flex-1 text-left">{t[opt.label]}</span>
              {theme === opt.value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent shrink-0">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">{t.language}</h2>
        <div className="flex flex-col gap-2">
          {LANG_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                lang === code ? "border-accent stone" : "border-border stone hover:border-subtle"
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

      {/* Privacy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">{t.privacy}</h2>

        {/* PIN lock */}
        <div className="stone border border-border rounded-2xl px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-primary">{t.pinLock}</span>
              <span className="text-xs text-muted">{t.pinLockDesc}</span>
            </div>
            {pinSet ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-accent">{t.pinEnabled}</span>
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="text-xs text-muted hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-border"
                >
                  {t.changePin}
                </button>
                <button
                  onClick={handleRemovePin}
                  className="text-xs hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-border"
                  style={{ color: "var(--c-relapse-text)" }}
                >
                  {t.removePin}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinSetup(true)}
                className="text-sm text-accent hover:opacity-80 transition-opacity shrink-0"
              >
                {t.setPin}
              </button>
            )}
          </div>

          {/* Auto-lock (only if PIN set) */}
          {pinSet && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted">{t.autoLock}</span>
              <div className="flex gap-1">
                {AUTO_LOCK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAutoLockChange(opt.value)}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                      autoLock === opt.value
                        ? "bg-accent text-white"
                        : "text-muted hover:text-primary hover:bg-border"
                    }`}
                  >
                    {t[opt.labelKey]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* App title disguise */}
        <div className="stone border border-border rounded-2xl px-4 py-3 flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-primary">{t.appTitle}</span>
            <span className="text-xs text-muted">{t.appTitleHint}</span>
          </div>
          <div className="flex gap-2">
            <input
              ref={titleInputRef}
              type="text"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyTitle()}
              placeholder={t.appTitlePlaceholder}
              maxLength={40}
              className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-primary text-sm placeholder:text-muted outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleApplyTitle}
              className="px-3 py-2 rounded-xl bg-accent text-white text-sm hover:bg-accent-dim transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">{t.notifications}</h2>
        <button
          onClick={handleNotifyToggle}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
            notifyEnabled ? "border-accent stone" : "border-border stone hover:border-subtle"
          }`}
        >
          <span className="text-sm text-primary flex-1 text-left">{t.notifyUnlogged}</span>
          <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${notifyEnabled ? "bg-accent" : "bg-border"}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifyEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
        </button>
      </section>

      {/* Export */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">{t.exportData}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("json")}
            className="flex-1 py-3 rounded-2xl border border-border stone text-sm text-muted hover:text-primary hover:border-subtle transition-colors"
          >
            {t.exportJson}
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex-1 py-3 rounded-2xl border border-border stone text-sm text-muted hover:text-primary hover:border-subtle transition-colors"
          >
            {t.exportCsv}
          </button>
        </div>
        {exportMsg && <p className="text-xs text-accent text-center">{exportMsg}</p>}
      </section>

      <PinSetupModal
        isOpen={showPinSetup}
        onDone={() => {
          setShowPinSetup(false);
          setPinSet(true);
        }}
        onClose={() => setShowPinSetup(false)}
      />
    </motion.div>
  );
}
