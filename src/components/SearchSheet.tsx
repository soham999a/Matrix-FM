import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock } from "lucide-react";
import { useSearchStations } from "../hooks/useRadioStations";
import { usePlayer } from "../contexts/PlayerContext";

const RECENT_KEY = "matrix-fm-recent-searches";

function loadRecent(): string[] {
  try {
    const data = localStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const recent = loadRecent().filter(s => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchSheet({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const { data: results, isLoading } = useSearchStations(query);
  const { player } = usePlayer();
  const inputRef = useRef<HTMLInputElement>(null);
  const touchStart = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
    setQuery("");
  }, [onClose]);

  const handleSelect = useCallback(
    (name: string) => {
      saveRecent(name);
      setRecent(loadRecent());
    },
    []
  );

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
      if (diff > 100) handleClose();
    },
    [handleClose]
  );

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-[70] bg-ink rounded-t-[16px] animate-slide-up flex flex-col max-h-[85dvh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="w-8 h-1 bg-hairline rounded-full mx-auto mt-grid-1 mb-grid-1 opacity-40" />

        {/* Search Input */}
        <div className="px-grid-2 pb-grid-2">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-slate" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search stations..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-12 bg-transparent border border-hairline rounded-lg pl-10 pr-16 text-bone text-sm font-sans outline-none placeholder:text-slate focus:border-gold transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 text-slate hover:text-bone"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-grid-2 pb-grid-3">
          {/* Recent Searches (always visible when empty query) */}
          {query.length === 0 && recent.length > 0 && (
            <div className="mb-grid-3">
              <h4 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase mb-grid-2">
                RECENT SEARCHES
              </h4>
              <div className="flex flex-wrap gap-grid-1">
                {recent.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-1 px-grid-2 py-grid-1 border border-hairline rounded-md font-sans text-xs text-bone hover:bg-ink-light transition-colors"
                  >
                    <Clock size={12} className="text-slate" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {query.length === 0 && (
            <div className="flex flex-col items-center justify-center py-grid-8">
              <Search size={40} className="text-hairline mb-grid-2" />
              <p className="font-sans text-sm text-slate">
                Type at least 2 characters
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && query.length >= 2 && (
            <div className="space-y-1">
              {/* Progress bar */}
              <div className="w-full h-[2px] bg-hairline/20 rounded-full overflow-hidden mb-grid-2">
                <div className="h-full w-1/3 bg-gold rounded-full animate-loading-slide" />
              </div>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="ink-card rounded-lg p-grid-2 flex items-center gap-2 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-md bg-hairline" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/5 bg-hairline rounded" />
                    <div className="h-2.5 w-2/5 bg-hairline rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && results?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-grid-8">
              <Search size={40} className="text-hairline mb-grid-2" />
              <h4 className="font-sans text-sm font-bold tracking-[0.1em] text-gold uppercase mb-grid-1">
                NO STATIONS FOUND
              </h4>
              <p className="font-sans text-xs text-slate max-w-[240px] text-center">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}

          {/* Results */}
          {!isLoading && results && results.length > 0 && (
            <div>
              <h4 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase mb-grid-2">
                SEARCH RESULTS
              </h4>
              <div className="space-y-1">
                {results.map(station => (
                  <button
                    key={station.id}
                    onClick={() => {
                      player.playWithTracking(station);
                      handleSelect(station.name);
                      handleClose();
                    }}
                    className="w-full ink-card rounded-lg p-grid-2 flex items-center gap-2 text-left hover:bg-ink-light transition-colors"
                  >
                    <div className="w-12 h-12 rounded-md bg-ink flex items-center justify-center shrink-0 overflow-hidden">
                      {station.favicon ? (
                        <img
                          src={station.favicon}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-ui text-[10px] text-slate">
                          {station.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-bone truncate">
                        {station.name}
                      </p>
                      <p className="font-sans text-xs text-slate truncate">
                        {station.country} &middot; {station.tags?.split(",")[0] || "Radio"}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-slate shrink-0">
                      {station.bitrate || "??"}k
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
