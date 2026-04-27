import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Stone() {
  const [isBlinking, setIsBlinking] = useState(false);

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

  const eyeVariants = {
    open: { scaleY: 1 },
    blink: { scaleY: 0.05 },
  };

  const eyeTransition = { duration: 0.07, ease: "easeInOut" as const };

  return (
    <div className="fixed bottom-6 right-6 pointer-events-none select-none z-50">
      <svg
        width="90"
        height="80"
        viewBox="0 0 90 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="45" cy="68" rx="38" ry="8" fill="#0a0806" opacity="0.3" />

        <ellipse cx="45" cy="46" rx="40" ry="28" fill="#3a3530" />
        <ellipse cx="45" cy="44" rx="38" ry="26" fill="#524c46" />
        <ellipse cx="45" cy="43" rx="36" ry="25" fill="#5e5850" />

        <ellipse
          cx="31"
          cy="31"
          rx="11"
          ry="6"
          fill="#9a9088"
          opacity="0.28"
          transform="rotate(-20 31 31)"
        />

        <motion.g
          style={{ transformOrigin: "32px 44px" }}
          variants={eyeVariants}
          animate={isBlinking ? "blink" : "open"}
          transition={eyeTransition}
        >
          <ellipse cx="32" cy="44" rx="5.5" ry="5.5" fill="#181410" />
          <circle cx="34" cy="42" r="1.8" fill="white" opacity="0.85" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "58px 44px" }}
          variants={eyeVariants}
          animate={isBlinking ? "blink" : "open"}
          transition={eyeTransition}
        >
          <ellipse cx="58" cy="44" rx="5.5" ry="5.5" fill="#181410" />
          <circle cx="60" cy="42" r="1.8" fill="white" opacity="0.85" />
        </motion.g>
      </svg>
    </div>
  );
}
