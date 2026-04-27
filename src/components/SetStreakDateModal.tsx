import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n";

interface SetStreakDateModalProps {
  isOpen: boolean;
  currentDate: string | null;
  onSet: (date: string) => void;
  onClose: () => void;
}

export default function SetStreakDateModal({
  isOpen,
  currentDate,
  onSet,
  onClose,
}: SetStreakDateModalProps) {
  const { t } = useLang();
  const today = new Date().toISOString().split("T")[0];
  const [selected, setSelected] = useState(currentDate ?? today);

  useEffect(() => {
    if (isOpen) setSelected(currentDate ?? today);
  }, [isOpen, currentDate, today]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50"
            onKeyDown={handleKeyDown}
          >
            <div className="stone border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
              <h2 className="text-primary font-semibold text-base">{t.chooseStartDate}</h2>
              <input
                type="date"
                value={selected}
                min="2000-01-01"
                max={today}
                onChange={(e) => setSelected(e.target.value)}
                className="bg-bg border border-border rounded-xl px-4 py-3 text-primary text-sm outline-none focus:border-accent transition-colors w-full"
                style={{ colorScheme: "dark" }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-muted text-sm hover:text-primary hover:border-subtle transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => onSet(selected)}
                  disabled={!selected}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dim transition-colors disabled:opacity-40"
                >
                  {t.add}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
