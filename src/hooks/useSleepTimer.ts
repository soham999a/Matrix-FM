import { useState, useCallback, useRef, useEffect } from "react";

export function useSleepTimer() {
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimerEndRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active || remaining <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setActive(false);
          onTimerEndRef.current?.();
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, remaining]);

  const startTimer = useCallback((minutes: number, onEnd: () => void) => {
    onTimerEndRef.current = onEnd;
    setDuration(minutes * 60);
    setRemaining(minutes * 60);
    setActive(true);
  }, []);

  const cancelTimer = useCallback(() => {
    setActive(false);
    setRemaining(0);
    setDuration(0);
  }, []);

  const formatted = active
    ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
    : null;

  return { active, remaining, duration, formatted, startTimer, cancelTimer };
}
