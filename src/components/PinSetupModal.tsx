import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../i18n";
import { savePin } from "./LockScreen";

interface PinSetupModalProps {
  isOpen: boolean;
  onDone: () => void;
  onClose: () => void;
}

const NUMPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PinSetupModal({ isOpen, onDone, onClose }: PinSetupModalProps) {
  const { t } = useLang();
  const [step, setStep] = useState<"new" | "confirm">("new");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState(false);

  const current = step === "new" ? first : second;
  const setCurrent = step === "new" ? setFirst : setSecond;

  const reset = () => {
    setStep("new");
    setFirst("");
    setSecond("");
    setError(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDigit = async (key: string) => {
    if (error) return;
    if (key === "⌫") {
      setCurrent((p) => p.slice(0, -1));
      return;
    }
    if (current.length >= 4) return;
    const next = current + key;
    setCurrent(next);

    if (next.length === 4) {
      if (step === "new") {
        setTimeout(() => setStep("confirm"), 100);
      } else {
        if (next === first) {
          await savePin(next);
          reset();
          onDone();
        } else {
          setError(true);
          setTimeout(reset, 700);
        }
      }
    }
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
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50"
          >
            <div className="stone border border-border rounded-2xl p-6 flex flex-col items-center gap-5 shadow-2xl">
              <h2 className="text-primary font-semibold text-base self-start">
                {step === "new" ? t.newPin : t.confirmPin}
              </h2>

              <motion.div
                className="flex gap-4"
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border-2 transition-all duration-150"
                    style={{
                      borderColor: error ? "var(--c-relapse-text)" : "var(--c-accent)",
                      background:
                        i < current.length
                          ? error
                            ? "var(--c-relapse-text)"
                            : "var(--c-accent)"
                          : "transparent",
                    }}
                  />
                ))}
              </motion.div>

              <div className="grid grid-cols-3 gap-2">
                {NUMPAD.map((key, i) =>
                  key === "" ? (
                    <div key={i} />
                  ) : (
                    <button
                      key={i}
                      onClick={() => handleDigit(key)}
                      className="w-14 h-14 rounded-xl stone border border-border text-primary text-lg font-medium hover:border-subtle transition-all active:scale-95"
                    >
                      {key}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl border border-border text-muted text-sm hover:text-primary hover:border-subtle transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
