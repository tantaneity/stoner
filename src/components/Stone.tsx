import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../i18n";
import { phrases } from "../phrases";

interface StoneProps {
  trigger?: number;
}

export default function Stone({ trigger = 0 }: StoneProps) {
  const { lang } = useLang();
  const [isBlinking, setIsBlinking] = useState(false);
  const [phrase, setPhrase] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const langRef = useRef(lang);
  langRef.current = lang;
  const lastIndexRef = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNowRef = useRef<(() => void) | null>(null);

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
    const pickPhrase = () => {
      const list = phrases[langRef.current];
      let idx = Math.floor(Math.random() * list.length);
      if (idx === lastIndexRef.current) idx = (idx + 1) % list.length;
      lastIndexRef.current = idx;
      return list[idx];
    };

    const scheduleIdle = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const delay = 20000 + Math.random() * 35000;
      timerRef.current = setTimeout(() => {
        const next = pickPhrase();
        setPhrase(next);
        const duration = Math.max(3000, Math.min(8000, 2500 + next.length * 50));
        timerRef.current = setTimeout(() => {
          setPhrase(null);
          scheduleIdle();
        }, duration);
      }, delay);
    };

    const showNow = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const next = pickPhrase();
      setPhrase(next);
      const duration = Math.max(3000, Math.min(8000, 2500 + next.length * 50));
      timerRef.current = setTimeout(() => {
        setPhrase(null);
        scheduleIdle();
      }, duration);
    };

    showNowRef.current = showNow;
    scheduleIdle();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setPhrase(null);
  }, [lang]);

  useEffect(() => {
    if (trigger === 0) return;
    showNowRef.current?.();
  }, [trigger]);

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={constraintsRef}
        onDragStart={() => { isDraggingRef.current = true; setIsDragging(true); }}
        onDragEnd={() => {
          setTimeout(() => { isDraggingRef.current = false; }, 50);
          setIsDragging(false);
        }}
        onTap={() => { if (!isDraggingRef.current) showNowRef.current?.(); }}
        className="absolute bottom-6 right-6 pointer-events-auto select-none cursor-pointer"
        style={{ width: 90, height: 90 }}
      >
        <AnimatePresence>
          {phrase && !isDragging && (
            <motion.div
              key={phrase}
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute bottom-full right-0 mb-3 stone border border-border rounded-2xl px-4 py-3 text-right pointer-events-none"
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
      </motion.div>
    </div>
  );
}
