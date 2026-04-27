import { useEffect, useState } from "react";

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

  return (
    <div className="fixed bottom-6 right-6 pointer-events-none select-none z-50">
      <img
        src={isBlinking ? "/stone_blink.png" : "/stone.png"}
        alt=""
        width={90}
        height={90}
        draggable={false}
      />
    </div>
  );
}
