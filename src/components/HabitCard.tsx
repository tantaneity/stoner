import { motion } from "framer-motion";
import type { Habit } from "../types";
import { useLang } from "../i18n";

interface HabitCardProps {
  habit: Habit;
  onCleanDay: (id: string) => void;
  onRelapse: (id: string) => void;
  onDelete: (id: string) => void;
  onStats: (id: string) => void;
}

export default function HabitCard({
  habit,
  onCleanDay,
  onRelapse,
  onDelete,
  onStats,
}: HabitCardProps) {
  const { t } = useLang();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2 }}
      className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-primary font-medium text-base leading-snug flex-1">
          {habit.name}
        </h2>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onStats(habit.id)}
            className="text-muted hover:text-primary transition-colors p-1 rounded-lg hover:bg-border"
            title={t.stats}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" opacity="0.6" />
              <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" opacity="0.8" />
              <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="text-muted hover:text-relapse-text transition-colors p-1 rounded-lg hover:bg-border"
            title={t.deleteHabit}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 6v5M10 6v5M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M13 4l-.8 9.2A1 1 0 0111.2 14H4.8a1 1 0 01-1-.8L3 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-3xl font-bold text-primary tabular-nums">
            {habit.currentStreak}
          </div>
          <div className="text-xs text-muted mt-0.5">{t.currentStreak}</div>
        </div>
        <div className="flex-1">
          <div className="text-xl font-semibold text-subtle tabular-nums">
            {habit.bestStreak}
          </div>
          <div className="text-xs text-muted mt-0.5">{t.bestStreak}</div>
        </div>
        <div className="flex-1">
          <div className="text-xl font-semibold text-subtle tabular-nums">
            {habit.totalRelapses}
          </div>
          <div className="text-xs text-muted mt-0.5">{t.totalRelapses}</div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onCleanDay(habit.id)}
          className="flex-1 py-2 px-3 rounded-xl bg-clean border border-clean text-clean-text text-sm font-medium hover:brightness-125 transition-all active:scale-95"
        >
          {t.cleanDay}
        </button>
        <button
          onClick={() => onRelapse(habit.id)}
          className="flex-1 py-2 px-3 rounded-xl bg-relapse border border-relapse text-relapse-text text-sm font-medium hover:brightness-125 transition-all active:scale-95"
        >
          {t.relapse}
        </button>
      </div>
    </motion.div>
  );
}
