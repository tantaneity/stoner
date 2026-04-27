import { useState, useMemo } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";
import type { Habit } from "../types";
import { useLang } from "../i18n";
import SetStreakDateModal from "./SetStreakDateModal";
import RelapseNoteModal from "./RelapseNoteModal";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

interface HabitCardProps {
  habit: Habit;
  onCleanDay: (id: string) => void;
  onRelapse: (id: string, note?: string) => void;
  onDelete: (id: string) => void;
  onStats: (id: string) => void;
  onSetStreakDate: (id: string, date: string | null) => void;
  onSetImage: (id: string, image: string | undefined) => void;
}

function streakFromDate(dateStr: string): number {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HabitCard({
  habit,
  onCleanDay,
  onRelapse,
  onDelete,
  onStats,
  onSetStreakDate,
  onSetImage,
}: HabitCardProps) {
  const { t } = useLang();
  const controls = useDragControls();
  const [showDateModal, setShowDateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const handlePickImage = async () => {
    const path = await open({
      multiple: false,
      filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "webp", "gif"] }],
    });
    if (typeof path === "string") {
      const bytes = await readFile(path);
      const blob = new Blob([bytes]);
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      onSetImage(habit.id, dataUrl);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const todayEntry = useMemo(
    () => habit.history.find((e) => e.timestamp.startsWith(todayStr)) ?? null,
    [habit.history, todayStr]
  );

  const isDateTracked = habit.streakStartDate !== null;
  const alreadyLoggedToday = !isDateTracked && todayEntry !== null;

  const displayStreak = isDateTracked
    ? streakFromDate(habit.streakStartDate!)
    : habit.currentStreak;

  return (
    <>
      <Reorder.Item
        value={habit}
        dragListener={false}
        dragControls={controls}
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.2 }}
        className="stone border border-border rounded-2xl p-5 flex flex-col gap-4"
        style={{ listStyle: "none" }}
      >
        <div className="flex items-start justify-between gap-2">
          <motion.div
            onPointerDown={(e) => controls.start(e)}
            className="text-muted/30 hover:text-muted/70 cursor-grab active:cursor-grabbing transition-colors shrink-0 touch-none pt-0.5"
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="7" r="1.5" />
              <circle cx="8" cy="7" r="1.5" />
              <circle cx="2" cy="12" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
            </svg>
          </motion.div>

          {habit.image ? (
            <button
              onClick={handlePickImage}
              className="shrink-0 rounded-xl overflow-hidden border border-border hover:border-subtle transition-colors"
              title={t.changeImage}
            >
              <img src={habit.image} alt="" className="w-9 h-9 object-cover" />
            </button>
          ) : (
            <button
              onClick={handlePickImage}
              className="shrink-0 w-9 h-9 rounded-xl border border-dashed border-border text-muted/40 hover:text-muted/80 hover:border-subtle transition-colors flex items-center justify-center"
              title={t.addImage}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <h2 className="text-primary font-medium text-sm leading-snug flex-1">
            {habit.name}
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onStats(habit.id)}
              className="text-muted hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-border"
              title={t.stats}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" opacity="0.75" />
                <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="text-muted hover:text-relapse-text transition-colors p-1.5 rounded-lg hover:bg-border"
              title={t.deleteHabit}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 6v5M10 6v5M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M13 4l-.8 9.2A1 1 0 0111.2 14H4.8a1 1 0 01-1-.8L3 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-5">
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-primary tabular-nums leading-none">
              {displayStreak}
            </div>
            <div className="text-xs text-muted mt-1">{t.currentStreak}</div>
            {isDateTracked ? (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-muted">{t.streakSince}</span>
                <span className="text-xs text-accent">
                  {formatShortDate(habit.streakStartDate!)}
                </span>
                <button
                  onClick={() => onSetStreakDate(habit.id, null)}
                  className="text-muted hover:text-primary text-xs ml-0.5 leading-none"
                  title={t.clearDate}
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDateModal(true)}
                className="mt-2 text-xs text-muted hover:text-accent transition-colors self-start"
              >
                + {t.setStreakStart}
              </button>
            )}
          </div>

          <div className="flex gap-4 ml-auto items-start">
            <div className="flex flex-col items-end">
              <div className="text-xl font-semibold text-subtle tabular-nums leading-none">
                {habit.bestStreak}
              </div>
              <div className="text-xs text-muted mt-1">{t.bestStreak}</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xl font-semibold tabular-nums leading-none" style={{ color: "var(--c-relapse-text)" }}>
                {habit.totalRelapses}
              </div>
              <div className="text-xs text-muted mt-1">{t.totalRelapses}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {isDateTracked ? (
            <>
              <div className="flex-1" />
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: "var(--c-relapse)", color: "var(--c-relapse-text)" }}
              >
                {t.relapse}
              </button>
            </>
          ) : alreadyLoggedToday ? (
            <div className="w-full py-2 text-center text-xs text-muted">
              {t.loggedToday} ·{" "}
              <span style={{ color: todayEntry!.type === "clean" ? "var(--c-clean-text)" : "var(--c-relapse-text)" }}>
                {todayEntry!.type === "clean" ? t.cleanDay : t.relapse}
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={() => onCleanDay(habit.id)}
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: "var(--c-clean)", color: "var(--c-clean-text)" }}
              >
                {t.cleanDay}
              </button>
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: "var(--c-relapse)", color: "var(--c-relapse-text)" }}
              >
                {t.relapse}
              </button>
            </>
          )}
        </div>
      </Reorder.Item>

      <SetStreakDateModal
        isOpen={showDateModal}
        currentDate={habit.streakStartDate}
        onSet={(date) => {
          onSetStreakDate(habit.id, date);
          setShowDateModal(false);
        }}
        onClose={() => setShowDateModal(false)}
      />

      <RelapseNoteModal
        isOpen={showNoteModal}
        onConfirm={(note) => {
          onRelapse(habit.id, note);
          setShowNoteModal(false);
        }}
        onClose={() => setShowNoteModal(false)}
      />
    </>
  );
}
