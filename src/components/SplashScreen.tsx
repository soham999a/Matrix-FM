import { useEffect, useState } from "react";
import { MatrixMark } from "./MatrixMark";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onFinish, 400);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink transition-opacity duration-400 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-grid-3 animate-fade-in">
        <div className="w-16 h-16 flex items-center justify-center rounded-md border border-hairline">
          <MatrixMark className="text-4xl" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-ui text-xs text-slate-light tracking-widest">
            MATRIX
          </span>
          <span className="w-[1px] h-3 bg-hairline" />
          <span className="font-ui text-xs text-slate-light tracking-widest">
            FM
          </span>
        </div>
      </div>
    </div>
  );
}
