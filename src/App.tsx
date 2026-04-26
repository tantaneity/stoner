import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Habit, AppData, Language } from "./types";
import { LangContext, translations } from "./i18n";
import { loadData, saveData } from "./storage";
import Stone from "./components/Stone";
import HabitCard from "./components/HabitCard";
import AddHabitModal from "./components/AddHabitModal";
import StatsView from "./components/StatsView";
import LanguageSwitcher from "./components/LanguageSwitcher";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  useEffect(() => {
    loadData().then((data: AppData) => {
      setHabits(data.habits);
      setLanguage(data.language);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveData({ habits, language });
  }, [habits, language, isLoaded]);

  const handleAddHabit = useCallback((name: string) => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      bestStreak: 0,
      totalRelapses: 0,
      lastRelapseAt: null,
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
  }, []);

  const handleRelapse = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        return {
          ...h,
          currentStreak: 0,
          totalRelapses: h.totalRelapses + 1,
          lastRelapseAt: new Date().toISOString(),
          history: [
            ...h.history,
            { timestamp: new Date().toISOString(), type: "relapse" as const },
          ],
        };
      })
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (selectedHabitId === id) setSelectedHabitId(null);
  }, [selectedHabitId]);

  const handleSetLang = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) ?? null;
  const t = translations[language];

  if (!isLoaded) {
    return <div className="h-full bg-bg" />;
  }

  return (
    <LangContext.Provider value={{ lang: language, t, setLang: handleSetLang }}>
      <div className="min-h-full bg-bg">
        <div className="max-w-xl mx-auto px-5 py-6">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-primary font-semibold text-xl tracking-tight">stoner</h1>
            <LanguageSwitcher />
          </header>

          <AnimatePresence mode="wait">
            {selectedHabit ? (
              <StatsView
                key="stats"
                habit={selectedHabit}
                onBack={() => setSelectedHabitId(null)}
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
                  <AnimatePresence>
                    {habits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onCleanDay={handleCleanDay}
                        onRelapse={handleRelapse}
                        onDelete={handleDelete}
                        onStats={setSelectedHabitId}
                      />
                    ))}
                  </AnimatePresence>
                )}

                <button
                  onClick={() => setIsAddingHabit(true)}
                  className="mt-2 w-full py-3 rounded-2xl border border-border text-muted text-sm hover:text-primary hover:border-subtle transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {t.addHabit}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Stone />

        <AddHabitModal
          isOpen={isAddingHabit}
          onAdd={handleAddHabit}
          onClose={() => setIsAddingHabit(false)}
        />
      </div>
    </LangContext.Provider>
  );
}
