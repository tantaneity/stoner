import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../i18n";
import { phrases } from "../phrases";

export default function Stone() {
  const { lang } = useLang();
  const [isBlinking, setIsBlinking] = useState(false);
  const [phrase, setPhrase] = useState<string | null>(null);

  const langRef = useRef(lang);
  langRef.current = lang;
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 5000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        timeoutId = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 130);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const pickPhrase = () => {
      const list = phrases[langRef.current];
      let idx = Math.floor(Math.random() * list.length);
      if (idx === lastIndexRef.current) idx = (idx + 1) % list.length;
      lastIndexRef.current = idx;
      return list[idx];
    };

    const schedulePhrase = () => {
      const delay = 20000 + Math.random() * 35000;
      timeoutId = setTimeout(() => {
        const next = pickPhrase();
        setPhrase(next);
        const duration = Math.max(3000, Math.min(8000, 2500 + next.length * 50));
        timeoutId = setTimeout(() => {
          setPhrase(null);
          schedulePhrase();
        }, duration);
      }, delay);
    };

    schedulePhrase();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setPhrase(null);
  }, [lang]);

  return (
    <div className="fixed bottom-6 right-6 pointer-events-none select-none z-50">
      <AnimatePresence>
        {phrase && (
          <motion.div
            key={phrase}
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-full right-0 mb-3 stone border border-border rounded-2xl px-4 py-3 text-right"
            style={{ maxWidth: "220px", minWidth: "120px" }}
          >
            {phrase.split("\n").map((line, i) => (
              <div
                key={i}
                className="text-xs leading-relaxed"
                style={{ color: "var(--c-primary)", opacity: i === 0 ? 1 : 0.7 }}
              >
                {line}
              </div>
            ))}
            <div
              className="absolute -bottom-[5px] right-8 w-2.5 h-2.5 border-r border-b border-border rotate-45"
              style={{ background: "var(--c-surface)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={isBlinking ? "/stone_blink.png" : "/stone.png"}
        alt=""
        width={90}
        height={90}
        draggable={false}
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
