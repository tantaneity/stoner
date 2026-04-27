import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n";

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode("stoner:" + pin);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem("pinHash");
  if (!stored) return false;
  return (await hashPin(pin)) === stored;
}

export async function savePin(pin: string): Promise<void> {
  localStorage.setItem("pinHash", await hashPin(pin));
}

export function clearPin(): void {
  localStorage.removeItem("pinHash");
}

export function hasPin(): boolean {
  return !!localStorage.getItem("pinHash");
}

const NUMPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useLang();
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  const handleDigit = useCallback(
    async (key: string) => {
      if (shake) return;
      if (key === "⌫") {
        setPin((p) => p.slice(0, -1));
        return;
      }
      if (pin.length >= 4) return;
      const next = pin + key;
      setPin(next);
      if (next.length === 4) {
        const ok = await verifyPin(next);
        if (ok) {
          onUnlock();
        } else {
          setShake(true);
          setTimeout(() => {
            setPin("");
            setShake(false);
          }, 600);
        }
      }
    },
    [pin, shake, onUnlock]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      if (e.key === "Backspace") handleDigit("⌫");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDigit]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 bg-bg flex flex-col items-center justify-center gap-8 z-[100]"
    >
      <motion.img
        src="/stone.png"
        width={72}
        height={72}
        alt=""
        draggable={false}
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <p className="text-muted text-sm tracking-wide">{t.enterPin}</p>

      <motion.div
        className="flex gap-4"
        animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full border-2 transition-all duration-150"
            style={{
              borderColor: shake
                ? "var(--c-relapse-text)"
                : "var(--c-accent)",
              background:
                i < pin.length
                  ? shake
                    ? "var(--c-relapse-text)"
                    : "var(--c-accent)"
                  : "transparent",
            }}
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {NUMPAD.map((key, i) =>
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => handleDigit(key)}
              className="w-16 h-16 rounded-2xl stone border border-border text-primary text-xl font-medium hover:border-subtle transition-all active:scale-95"
            >
              {key}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
