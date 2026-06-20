import { useEffect, useRef, useCallback } from "react";
import { LogOut } from "lucide-react";

interface Props {
  open: boolean;
  onStay: () => void;
  onExit: () => void;
}

export function ExitDialog({ open, onStay, onExit }: Props) {
  const touchStart = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - touchStart.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = e.changedTouches[0].clientY - touchStart.current;
      if (sheetRef.current) {
        sheetRef.current.style.transform = "";
      }
      if (diff > 100) onStay();
    },
    [onStay]
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm animate-fade-in"
        onClick={onStay}
      />
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-[70] bg-ink rounded-t-[16px] animate-slide-up flex flex-col items-center pb-grid-3 pt-grid-1 px-grid-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="w-8 h-1 bg-hairline rounded-full mb-grid-2 opacity-40" />
        <div className="w-full max-w-md">
          {/* Content */}
          <div className="mb-grid-3 text-center md:text-left">
            <div className="flex items-center justify-center gap-2 mb-grid-1">
              <LogOut size={18} className="text-bone" />
              <h3 className="font-sans text-lg font-medium text-bone">
                Exit app?
              </h3>
            </div>
            <p className="font-sans text-sm text-slate">
              Your stream will stop.
            </p>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col gap-grid-2 w-full">
            <button
              onClick={onExit}
              className="w-full h-12 bg-gold rounded-lg flex items-center justify-center text-ink font-medium hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Exit
            </button>
            <button
              onClick={onStay}
              className="w-full h-12 bg-transparent border border-hairline rounded-lg flex items-center justify-center text-bone font-medium hover:bg-ink-light active:scale-[0.98] transition-all"
            >
              Stay
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
