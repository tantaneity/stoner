import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import type { Habit, AppData, Language, Theme } from "./types";
import { LangContext, translations } from "./i18n";
import { loadData, saveData } from "./storage";
import Stone from "./components/Stone";
import HabitCard from "./components/HabitCard";
import AddHabitModal from "./components/AddHabitModal";
import StatsView from "./components/StatsView";
import SettingsView from "./components/SettingsView";
import PrivacyNoticeModal from "./components/PrivacyNoticeModal";
import LockScreen, { hasPin } from "./components/LockScreen";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";

type Tab = "habits" | "settings";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("habits");
  const [stoneTrigger, setStoneTrigger] = useState(0);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const lastUnlockRef = useRef<number>(0);

  useEffect(() => {
    loadData().then(async (data: AppData) => {
      setHabits(data.habits);
      setLanguage(data.language);
      setThemeState(data.theme);
      applyTheme(data.theme);
      setIsLoaded(true);

      // Restore disguised window title
      const savedTitle = localStorage.getItem("appTitle");
      if (savedTitle) getCurrentWindow().setTitle(savedTitle);

      // Lock on startup if PIN is set
      if (hasPin()) {
        setIsLocked(true);
      } else if (!localStorage.getItem("privacyNoticeSeen")) {
        setShowPrivacyNotice(true);
      }

      if (localStorage.getItem("notifyUnlogged") === "true") {
        const granted = await isPermissionGranted();
        if (granted) {
          const todayStr = new Date().toISOString().split("T")[0];
          const lastNotified = localStorage.getItem("lastNotifiedDate");
          const hasUnlogged = data.habits.some(
            (h) => !h.history.some((e) => e.timestamp.startsWith(todayStr))
          );
          if (hasUnlogged && lastNotified !== todayStr) {
            localStorage.setItem("lastNotifiedDate", todayStr);
            sendNotification({ title: "Stoner", body: translations[data.language].notifyBody });
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveData({ habits, language, theme });
  }, [habits, language, theme, isLoaded]);

  // Scheduled reminder: check every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      if (localStorage.getItem("notifyUnlogged") !== "true") return;
      const reminderTime = localStorage.getItem("reminderTime") ?? "09:00";
      const now = new Date();
      const [rh, rm] = reminderTime.split(":").map(Number);
      if (now.getHours() !== rh || now.getMinutes() !== rm) return;
      const todayStr = now.toISOString().split("T")[0];
      if (localStorage.getItem("lastNotifiedDate") === todayStr) return;
      const granted = await isPermissionGranted();
      if (!granted) return;
      const hasUnlogged = habits.some(
        (h) => !h.history.some((e) => e.timestamp.startsWith(todayStr))
      );
      if (!hasUnlogged) return;
      localStorage.setItem("lastNotifiedDate", todayStr);
      sendNotification({ title: "Stoner", body: t.notifyBody });
    }, 60_000);
    return () => clearInterval(interval);
  }, [habits, t]);

  // Auto-lock on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (!hasPin()) return;
      const setting = localStorage.getItem("autoLock") ?? "off";
      if (setting === "off") return;
      const ms = setting === "1m" ? 60_000 : setting === "5m" ? 300_000 : 900_000;
      if (Date.now() - lastUnlockRef.current > ms) setIsLocked(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleSetTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  }, []);

  const handleSetLang = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const handleAddHabit = useCallback((name: string) => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      bestStreak: 0,
      totalRelapses: 0,
      lastRelapseAt: null,
      streakStartDate: null,
      history: [],
    };
    setHabits((prev) => [newHabit, ...prev]);
    setIsAddingHabit(false);
  }, []);

  const handleCleanDay = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const newStreak = h.currentStreak + 1;
        return {
          ...h,
          currentStreak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
          history: [
            ...h.history,
            { timestamp: new Date().toISOString(), type: "clean" as const },
          ],
        };
      })
    );
    setStoneTrigger((c) => c + 1);
  }, []);

  const handleRelapse = useCallback((id: string, note?: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        return {
          ...h,
          currentStreak: 0,
          streakStartDate: null,
          totalRelapses: h.totalRelapses + 1,
          lastRelapseAt: new Date().toISOString(),
          history: [
            ...h.history,
            { timestamp: new Date().toISOString(), type: "relapse" as const, ...(note ? { note } : {}) },
          ],
        };
      })
    );
    setStoneTrigger((c) => c + 1);
  }, []);

  const handleSetStreakDate = useCallback((id: string, date: string | null) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        if (date === null) return { ...h, streakStartDate: null };
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newStreak = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
        return {
          ...h,
          streakStartDate: date,
          currentStreak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
        };
      })
    );
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      if (selectedHabitId === id) setSelectedHabitId(null);
    },
    [selectedHabitId]
  );

  const handleSetImage = useCallback((id: string, image: string | undefined) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, image } : h)));
  }, []);

  const buildExportJson = useCallback(() => {
    return JSON.stringify({ habits }, null, 2);
  }, [habits]);

  const buildExportCsv = useCallback(() => {
    const rows = ["habit,date,type,note,streak"];
    for (const h of habits) {
      let streak = 0;
      for (const e of [...h.history].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )) {
        if (e.type === "relapse") streak = 0; else streak++;
        rows.push(
          [h.name, e.timestamp.split("T")[0], e.type, e.note ?? "", streak]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
      }
    }
    return rows.join("\n");
  }, [habits]);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) ?? null;
  const t = translations[language];

  if (!isLoaded) {
    return <div className="h-full bg-bg" />;
  }

  if (isLocked) {
    return (
      <LangContext.Provider value={{ lang: language, t, setLang: handleSetLang, theme, setTheme: handleSetTheme }}>
        <div className="min-h-full bg-bg">
          <LockScreen
            onUnlock={() => {
              lastUnlockRef.current = Date.now();
              setIsLocked(false);
              if (!localStorage.getItem("privacyNoticeSeen")) setShowPrivacyNotice(true);
            }}
          />
        </div>
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider
      value={{ lang: language, t, setLang: handleSetLang, theme, setTheme: handleSetTheme }}
    >
      <div className="min-h-full bg-bg">
        <div className="max-w-xl mx-auto px-5 py-6">
          <header className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                setActiveTab("habits");
                setSelectedHabitId(null);
              }}
              className="text-primary font-semibold text-xl tracking-tight hover:opacity-70 transition-opacity"
            >
              stoner
            </button>

            <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
              <button
                onClick={() => {
                  setActiveTab("habits");
                  setSelectedHabitId(null);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === "habits" && !selectedHabitId
                    ? "text-primary bg-border"
                    : "text-muted hover:text-primary"
                }`}
                title="Habits"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor" />
                  <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="currentColor" />
                  <rect x="2" y="11.5" width="8" height="1.5" rx="0.75" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setSelectedHabitId(null);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === "settings"
                    ? "text-primary bg-border"
                    : "text-muted hover:text-primary"
                }`}
                title={t.settings}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 10a2 2 0 100-4 2 2 0 000 4z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M13.3 8c0-.23-.02-.46-.05-.68l1.47-1.14a.35.35 0 00.08-.45l-1.4-2.42a.35.35 0 00-.43-.15l-1.73.7a5.07 5.07 0 00-1.17-.68L9.8 1.97A.35.35 0 009.46 1.67H6.54a.35.35 0 00-.35.3L5.93 3.18a5.07 5.07 0 00-1.17.68l-1.73-.7a.35.35 0 00-.43.15L1.2 5.73a.35.35 0 00.08.45l1.47 1.14A5.18 5.18 0 002.7 8c0 .23.02.46.05.68L1.28 9.82a.35.35 0 00-.08.45l1.4 2.42c.09.16.28.22.43.15l1.73-.7c.37.27.76.49 1.17.68l.26 1.21c.05.23.26.4.5.4h2.92c.24 0 .45-.17.5-.4l.26-1.21a5.07 5.07 0 001.17-.68l1.73.7c.15.07.34.01.43-.15l1.4-2.42a.35.35 0 00-.08-.45L13.25 8.68A5.18 5.18 0 0013.3 8z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {selectedHabit ? (
              <StatsView
                key="stats"
                habit={selectedHabit}
                onBack={() => setSelectedHabitId(null)}
              />
            ) : activeTab === "settings" ? (
              <SettingsView
                key="settings"
                onExportJson={buildExportJson}
                onExportCsv={buildExportCsv}
              />
            ) : (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                {habits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <p className="text-muted text-sm">{t.noHabits}</p>
                    <p className="text-subtle text-xs">{t.addFirst}</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={habits}
                    onReorder={setHabits}
                    as="div"
                    className="flex flex-col gap-4"
                  >
                    <AnimatePresence initial={false}>
                      {habits.map((habit) => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          onCleanDay={handleCleanDay}
                          onRelapse={(id, note) => handleRelapse(id, note)}
                          onDelete={handleDelete}
                          onStats={setSelectedHabitId}
                          onSetStreakDate={handleSetStreakDate}
                        onSetImage={handleSetImage}
                        />
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                )}

                <button
                  onClick={() => setIsAddingHabit(true)}
                  className="mt-2 w-full py-3 rounded-2xl border border-border text-muted text-sm hover:text-primary hover:border-subtle transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {t.addHabit}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Stone trigger={stoneTrigger} />

        <AddHabitModal
          isOpen={isAddingHabit}
          onAdd={handleAddHabit}
          onClose={() => setIsAddingHabit(false)}
        />

        <PrivacyNoticeModal
          isOpen={showPrivacyNotice}
          onDismiss={() => {
            localStorage.setItem("privacyNoticeSeen", "1");
            setShowPrivacyNotice(false);
          }}
          onGoSettings={() => {
            localStorage.setItem("privacyNoticeSeen", "1");
            setShowPrivacyNotice(false);
            setActiveTab("settings");
            setSelectedHabitId(null);
          }}
        />
      </div>
    </LangContext.Provider>
  );
}
