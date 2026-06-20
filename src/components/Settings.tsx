import { useState, useCallback } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { Volume2, VolumeX, Trash2, LogOut, Music, RotateCcw } from "lucide-react";
import { toast } from "./Toasts";

export function Settings() {
  const { player, favorites, recentlyPlayed } = usePlayer();
  const { volume, setVolume, stop } = player;

  const [highFidelity, setHighFidelity] = useState(true);
  const [monoDownmix, setMonoDownmix] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const handleClearFavorites = useCallback(() => {
    const count = favorites.favorites.length;
    if (count === 0) return;
    favorites.favorites.forEach(f => favorites.removeFavorite(f.id));
    toast(`${count} favorites cleared`, "info");
  }, [favorites]);

  const handleClearRecent = useCallback(() => {
    recentlyPlayed.clearRecent();
    toast("Recently played cleared", "info");
  }, [recentlyPlayed]);

  const handleExit = useCallback(() => {
    stop();
    if (typeof window !== "undefined" && "Capacitor" in window) {
      // @ts-expect-error - Capacitor native exit
      window.Capacitor.Plugins.App.exitApp();
    } else {
      window.close();
    }
  }, [stop]);

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <div className="pb-grid-4">
        {/* Header */}
        <div className="px-grid-2 pt-grid-3 pb-grid-3">
          <h2 className="font-sans text-2xl font-semibold text-bone">
            Settings
          </h2>
          <p className="font-sans text-sm text-slate mt-1">
            Precision controls for your broadcast experience.
          </p>
        </div>

        {/* AUDIO Section */}
        <section className="mb-grid-4">
          <div className="px-grid-2 pb-grid-1">
            <h3 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase">
              AUDIO
            </h3>
          </div>
          <SettingsRow label="High Fidelity Stream" checked={highFidelity} onChange={setHighFidelity} />
          <SettingsRow label="Mono Downmix" checked={monoDownmix} onChange={setMonoDownmix} />
          <SettingsRow label="Haptic Feedback" checked={hapticFeedback} onChange={setHapticFeedback} />
          {/* Volume */}
          <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0">
            <span className="font-sans text-sm text-bone">Volume</span>
            <div className="flex items-center gap-2 w-1/2">
              <button
                onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                className="text-slate hover:text-bone transition-colors shrink-0"
              >
                {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div
                className="flex-1 h-[3px] bg-hairline rounded-full relative cursor-pointer"
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
          </div>
          <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0 border-b-0">
            <span className="font-sans text-sm text-bone">Audio Compression</span>
            <span className="font-mono text-xs text-slate">DYNAMIC</span>
          </div>
        </section>

        {/* DATA Section */}
        <section className="mb-grid-4">
          <div className="px-grid-2 pb-grid-1">
            <h3 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase">
              DATA
            </h3>
          </div>
          <SettingsRow label="Auto-update Stations" checked={autoUpdate} onChange={setAutoUpdate} />
          <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0">
            <span className="font-sans text-sm text-bone">Metadata Sync</span>
            <span className="font-mono text-xs text-slate">ENABLED</span>
          </div>
          {/* Saved Stations */}
          <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0">
            <div className="flex items-center gap-2">
              <Music size={14} className="text-slate" />
              <span className="font-sans text-sm text-bone">Saved Stations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate">{favorites.favorites.length}</span>
              {favorites.favorites.length > 0 && (
                <button onClick={handleClearFavorites} className="text-slate hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          {/* Recently Played */}
          <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0 border-b-0">
            <div className="flex items-center gap-2">
              <RotateCcw size={14} className="text-slate" />
              <span className="font-sans text-sm text-bone">Recently Played</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate">{recentlyPlayed.recent.length}</span>
              {recentlyPlayed.recent.length > 0 && (
                <button onClick={handleClearRecent} className="text-slate hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT Section */}
        <section className="mb-grid-4">
          <div className="px-grid-2 pb-grid-1">
            <h3 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase">
              ABOUT
            </h3>
          </div>
          <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0">
            <span className="font-sans text-sm text-bone">Version</span>
            <span className="font-mono text-xs text-slate">1.0.0-MATRIX</span>
          </div>
          <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0 border-b-0">
            <button className="font-sans text-sm text-bone hover:text-gold transition-colors text-left">
              Privacy Policy
            </button>
            <button className="font-sans text-sm text-bone hover:text-gold transition-colors text-left">
              License
            </button>
          </div>
        </section>

        {/* Exit Button */}
        <div className="px-grid-2">
          <button
            onClick={handleExit}
            className="w-full h-12 rounded-lg border border-red-500/30 flex items-center justify-center gap-2 text-red-400 font-sans text-sm hover:bg-red-500/5 active:scale-[0.98] transition-all"
          >
            <LogOut size={16} />
            Exit App
          </button>
        </div>

        <div className="mt-grid-4 px-grid-2 text-center">
          <p className="font-sans text-xs text-slate">
            MATRIX FM &mdash; Timeless Precision Architecture
          </p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${
        checked ? "bg-gold" : "bg-hairline"
      }`}
    >
      <div
        className={`absolute top-[2px] bg-white w-5 h-5 rounded-full transition-transform duration-200 ${
          checked ? "left-[22px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}

function SettingsRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="h-14 px-grid-2 flex items-center justify-between ink-card border-x-0 border-t-0">
      <span className="font-sans text-sm text-bone">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
