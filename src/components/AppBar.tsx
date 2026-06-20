import { RefreshCw } from "lucide-react";
import { MatrixMark } from "./MatrixMark";
import { usePlayer } from "../contexts/PlayerContext";

export function AppBar({ onRefresh }: { onRefresh?: () => void }) {
  const { player } = usePlayer();
  const isLoading = player.isLoading;

  return (
    <header className="h-14 flex items-center justify-between px-grid-2 bg-ink border-b border-hairline shrink-0">
      <div className="flex items-center gap-2">
        <MatrixMark className="text-xl" />
        <span className="font-ui text-sm text-bone tracking-tight">MATRIX FM</span>
      </div>
      <button
        onClick={onRefresh}
        className="p-2 text-slate hover:text-bone transition-colors duration-200"
        aria-label="Refresh"
      >
        <RefreshCw
          size={18}
          className={isLoading ? "animate-spin" : ""}
        />
      </button>
    </header>
  );
}
