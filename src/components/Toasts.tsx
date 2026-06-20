import { useState, useCallback } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;
let globalSetToasts: ((fn: (prev: Toast[]) => Toast[]) => void) | null = null;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  globalSetToasts = setToasts;

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function toast(message: string, type: Toast["type"] = "info") {
  globalSetToasts?.((prev) => {
    const id = ++toastId;
    setTimeout(() => {
      globalSetToasts?.((p) => p.filter(t => t.id !== id));
    }, 3000);
    return [...prev, { id, message, type }];
  });
}

export function Toasts({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[300] flex flex-col items-center gap-1 px-grid-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-slide-up px-grid-2 py-1.5 rounded-lg text-sm font-sans shadow-lg ${
            t.type === "success"
              ? "bg-gold text-ink"
              : t.type === "error"
              ? "bg-red-500 text-white"
              : "bg-ink-light text-bone border border-hairline"
          }`}
          onClick={() => onRemove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
