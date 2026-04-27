import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n";

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onGoSettings: () => void;
}

export default function PrivacyNoticeModal({
  isOpen,
  onDismiss,
  onGoSettings,
}: PrivacyNoticeModalProps) {
  const { t } = useLang();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50"
          >
            <div className="stone border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">

              {/* Stone + speech bubble */}
              <div className="flex items-end gap-4">
                <img
                  src="/stone.png"
                  alt=""
                  width={72}
                  height={72}
                  draggable={false}
                  className="shrink-0"
                />
                <div className="relative stone border border-border rounded-2xl px-4 py-3 flex-1 mb-2">
                  {t.privacyStonePhrase.split("\n").map((line, i) => (
                    <div
                      key={i}
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--c-primary)", opacity: i === 0 ? 1 : 0.7 }}
                    >
                      {line}
                    </div>
                  ))}
                  {/* tail pointing left toward stone */}
                  <div
                    className="absolute -left-[5px] bottom-4 w-2.5 h-2.5 border-l border-b border-border rotate-45"
                    style={{ background: "var(--c-surface)" }}
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted leading-relaxed">
                {t.privacyDesc}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onDismiss}
                  className="flex-1 py-2.5 rounded-xl border border-border text-muted text-sm hover:text-primary hover:border-subtle transition-colors"
                >
                  {t.privacyLater}
                </button>
                <button
                  onClick={onGoSettings}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dim transition-colors flex items-center justify-center gap-1.5"
                >
                  {t.privacySetup}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
