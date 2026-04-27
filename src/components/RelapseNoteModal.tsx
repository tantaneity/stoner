import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n";

interface RelapseNoteModalProps {
  isOpen: boolean;
  onConfirm: (note?: string) => void;
  onClose: () => void;
}

export default function RelapseNoteModal({ isOpen, onConfirm, onClose }: RelapseNoteModalProps) {
  const { t } = useLang();
  const [note, setNote] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNote("");
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen]);

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
              <h2 className="text-primary font-semibold text-base">{t.relapseNoteTitle}</h2>
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.relapseNotePlaceholder}
                rows={3}
                className="bg-bg border border-border rounded-xl px-4 py-3 text-primary text-sm placeholder:text-muted outline-none focus:border-accent transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onConfirm(undefined)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-muted text-sm hover:text-primary hover:border-subtle transition-colors"
                >
                  {t.skip}
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(note.trim() || undefined)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: "var(--c-relapse)", color: "var(--c-relapse-text)" }}
                >
                  {t.relapse}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
