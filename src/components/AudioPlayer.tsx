import { usePlayer } from "../contexts/PlayerContext";
import { Play, Pause } from "lucide-react";

export function AudioPlayer() {
  const { player } = usePlayer();
  const { currentStation, isPlaying, isLoading, togglePlay, error } = player;

  if (!currentStation) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 bg-ink/95 border-t border-hairline backdrop-blur-sm transition-all duration-300">
      <div className="flex items-center gap-2 px-grid-2 py-2">
        {/* Artwork */}
        <div className="w-10 h-10 rounded-md bg-ink-light flex items-center justify-center shrink-0 overflow-hidden">
          {currentStation.favicon ? (
            <img
              src={currentStation.favicon}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-ui text-[10px] text-slate">
              {currentStation.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm text-bone truncate">
            {currentStation.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Waveform bars */}
            {isPlaying && (
              <div className="flex items-center gap-[1.5px] h-3" aria-hidden>
                {[1, 2, 3, 4].map(i => (
                  <span
                    key={i}
                    className="w-[2px] bg-gold rounded-full animate-equalizer"
                    style={{
                      animationDelay: `${i * 0.12}s`,
                      animationDuration: "0.8s",
                    }}
                  />
                ))}
              </div>
            )}
            {isLoading && !isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            )}
            {error && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            )}
            <span className="font-sans text-[11px] text-slate">
              {error ? "Error"
                : isLoading ? "Connecting..."
                : isPlaying ? "Live"
                : "Paused"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-md border border-gold/50 flex items-center justify-center active:scale-90 transition-transform hover:border-gold/80"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading && !isPlaying ? (
            <span className="block w-3.5 h-3.5 border-[2px] border-gold border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={16} className="text-gold" />
          ) : (
            <Play size={16} className="text-gold ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
