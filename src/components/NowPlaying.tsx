import { useState, useEffect, useCallback } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import {
  Play, Pause, Volume2, VolumeX,
  Timer, Radio, Share2, Clock, X
} from "lucide-react";
import { MatrixMark } from "./MatrixMark";
import { SpectrumAnalyser } from "./SpectrumAnalyser";
import { toast } from "./Toasts";

const SLEEP_OPTIONS = [15, 30, 45, 60];

export function NowPlaying() {
  const { player, recentlyPlayed, sleepTimer } = usePlayer();
  const {
    currentStation, isPlaying, isLoading,
    togglePlay, volume, setVolume, error
  } = player;

  const [showTimer, setShowTimer] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    },
    [togglePlay]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleTimerSelect = useCallback(
    (minutes: number) => {
      sleepTimer.startTimer(minutes, () => {
        player.stop();
      });
      setShowTimer(false);
    },
    [sleepTimer, player]
  );

  if (!currentStation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-grid-3 animate-fade-in">
        <div className="w-24 h-24 rounded-xl border border-hairline flex items-center justify-center mb-grid-3">
          <MatrixMark className="text-5xl" />
        </div>
        <p className="font-sans text-sm text-slate mb-1">Select a station</p>
        <p className="font-sans text-xs text-slate">
          {recentlyPlayed.recent.length > 0
            ? "Tap a station from the list below"
            : "Browse stations to start listening"}
        </p>

        {recentlyPlayed.recent.length > 0 && (
          <div className="w-full max-w-md mt-grid-6">
            <div className="flex items-center justify-between mb-grid-2">
              <h2 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase">
                RECENTLY PLAYED
              </h2>
              <button
                onClick={recentlyPlayed.clearRecent}
                className="font-ui text-[10px] text-slate hover:text-bone tracking-wider transition-colors"
              >
                CLEAR
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {recentlyPlayed.recent.map(s => {
                const isActive = player.currentStation?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { if (isActive) player.togglePlay(); else player.playWithTracking(s); }}
                    className={`w-full ink-card rounded-lg p-grid-2 flex items-center gap-2 text-left transition-colors active:scale-[0.98] ${
                      isActive ? "border border-gold bg-ink-light" : "hover:bg-ink-light"
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-ink flex items-center justify-center shrink-0 overflow-hidden">
                      {s.favicon ? (
                        <img src={s.favicon} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-ui text-[10px] text-slate">{s.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-bone truncate">{s.name}</p>
                      <p className="font-ui text-[10px] text-slate uppercase tracking-wider truncate">
                        {s.tags?.split(",")[0] || s.country || "Radio"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isActive && player.isPlaying
                        ? <Pause size={16} className="text-gold" />
                        : <Play size={16} className="text-slate" />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-grid-3 animate-fade-in">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Station Artwork Container */}
        <div className="relative w-40 h-40 mb-grid-4">
          {/* LIVE Badge */}
          {isPlaying && (
            <div className="absolute -top-2 -right-2 bg-gold text-ink font-ui text-[10px] px-2 py-0.5 rounded-sm z-10 tracking-widest flex items-center gap-1">
              <div className="flex items-center gap-[1.5px] h-2">
                {[1, 2, 3].map(i => (
                  <span key={i} className="w-[2px] bg-ink rounded-full animate-equalizer" style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.6s" }} />
                ))}
              </div>
              LIVE
            </div>
          )}
          {/* Artwork */}
          <div className="w-full h-full ink-card rounded-xl overflow-hidden flex items-center justify-center">
            {currentStation.favicon ? (
              <img
                src={currentStation.favicon}
                alt=""
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <MatrixMark className="text-5xl" />
            )}
          </div>
        </div>

        {/* Audio Spectrum Analyser */}
        {isPlaying && <SpectrumAnalyser />}

        {isLoading && !error && (
          <div className="flex items-center justify-center gap-2 mb-grid-3 h-[30px]">
            <div className="flex items-center gap-[2px] h-4" aria-label="Buffering">
              <span className="w-[2px] bg-gold rounded-full animate-equalizer h-1" style={{ animationDelay: "0s" }} />
              <span className="w-[2px] bg-gold rounded-full animate-equalizer h-1" style={{ animationDelay: "0.15s" }} />
              <span className="w-[2px] bg-gold rounded-full animate-equalizer h-1" style={{ animationDelay: "0.3s" }} />
              <span className="w-[2px] bg-gold rounded-full animate-equalizer h-1" style={{ animationDelay: "0.45s" }} />
            </div>
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Connecting</span>
          </div>
        )}

        {/* Metadata Section */}
        <div className="text-center mb-grid-3">
          <h1 className="font-sans text-2xl font-semibold text-bone mb-grid-1 line-clamp-1">
            {currentStation.name}
          </h1>
          <p className="font-mono text-xs text-slate uppercase tracking-widest mb-grid-1">
            {currentStation.tags?.split(",")[0] || "Radio"}
          </p>
          <p className="font-mono text-sm text-slate">
            {currentStation.bitrate ? `${currentStation.bitrate}k` : "??"}k &middot;{" "}
            {currentStation.country || "Unknown"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-grid-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="font-sans text-xs text-red-400">{error}</span>
          </div>
        )}

        {/* Controls Row */}
        <div className="flex items-center justify-center gap-grid-4 mb-grid-4">
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="p-2 text-slate hover:text-bone transition-colors"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-xl border border-gold flex items-center justify-center active:scale-95 transition-transform hover:bg-gold/5"
          >
            {isLoading && !isPlaying ? (
              <span className="block w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={28} className="text-bone" />
            ) : (
              <Play size={28} className="text-bone ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setShowTimer(prev => !prev)}
            className={`p-2 transition-colors ${sleepTimer.active ? "text-gold" : "text-slate hover:text-bone"}`}
          >
            <Timer size={20} />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="w-full flex items-center gap-grid-2 mb-grid-3">
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-slate hover:text-bone transition-colors shrink-0"
          >
            <Volume2 size={14} />
          </button>
          <div
            className="relative flex-1 h-[3px] bg-hairline rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setVolume(Math.max(0, Math.min(1, pct)));
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-bone rounded-full transition-all duration-150"
              style={{ width: `${volume * 100}%` }}
            />
            <div
              className="absolute top-[-4px] w-[11px] h-[11px] bg-bone rounded-[3px] transition-all duration-150"
              style={{ left: `calc(${volume * 100}% - 5.5px)` }}
            />
          </div>
        </div>

        {/* Bottom row: codec + share + sleep timer */}
        <div className="flex justify-around w-full mt-grid-1">
          <div className="flex flex-col items-center gap-grid-1">
            <Radio size={18} className="text-slate" />
            <span className="font-ui text-[10px] text-slate tracking-wider">{currentStation.codec || "STREAM"}</span>
          </div>
          <button
            onClick={() => {
              const text = `${currentStation.name} — ${currentStation.url}`;
              navigator.clipboard?.writeText(text).then(() => toast("Station link copied")).catch(() => {});
            }}
            className="flex flex-col items-center gap-grid-1 text-slate hover:text-bone transition-colors"
          >
            <Share2 size={18} />
            <span className="font-ui text-[10px] tracking-wider">SHARE</span>
          </button>
          <button
            onClick={() => setShowTimer(prev => !prev)}
            className={`flex flex-col items-center gap-grid-1 transition-colors ${
              sleepTimer.active ? "text-gold" : "text-slate"
            }`}
          >
            <Clock size={18} />
            <span className="font-ui text-[10px] tracking-wider">
              {sleepTimer.formatted || "TIMER"}
            </span>
          </button>
        </div>

        {/* Sleep Timer Sheet */}
        {showTimer && (
          <div className="mt-grid-3 w-full ink-card rounded-xl p-grid-3 animate-slide-up">
            <div className="flex items-center justify-between mb-grid-2">
              <h3 className="font-ui text-[11px] font-bold tracking-[0.1em] text-bone uppercase">
                SLEEP TIMER
              </h3>
              {sleepTimer.active && (
                <button
                  onClick={() => { sleepTimer.cancelTimer(); setShowTimer(false); }}
                  className="flex items-center gap-1 text-slate hover:text-bone transition-colors"
                >
                  <X size={14} />
                  <span className="font-ui text-[10px] tracking-wider">CANCEL</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {SLEEP_OPTIONS.map(min => (
                <button
                  key={min}
                  onClick={() => handleTimerSelect(min)}
                  className={`px-grid-2 py-grid-1 rounded-md font-ui text-xs tracking-wider border transition-colors ${
                    sleepTimer.active && sleepTimer.duration === min * 60
                      ? "border-gold text-gold bg-gold/5"
                      : "border-hairline text-slate hover:text-bone hover:border-slate"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
            {sleepTimer.active && (
              <p className="font-mono text-xs text-slate mt-grid-2">
                Sleeping in {sleepTimer.formatted}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
