import { useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import type { RadioStation } from "../types/radio";
import { Play, Pause, Heart, Disc3 } from "lucide-react";

interface Props {
  station: RadioStation;
  isActive?: boolean;
  onPlay: (station: RadioStation) => void;
}

export function StationCard({ station, isActive = false, onPlay }: Props) {
  const { player, favorites } = usePlayer();
  const [imgError, setImgError] = useState(false);
  const isPlaying = isActive && player.isPlaying;
  const fav = favorites.isFavorite(station.id);

  const faviconSrc = station.favicon && !imgError
    ? station.favicon
    : null;

  return (
    <div
      className={`rounded-lg p-grid-2 flex items-center gap-grid-2 transition-all duration-200 relative ${
        isActive
          ? "bg-ink-light border border-gold"
          : "ink-card hover:bg-ink-light"
      }`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center shrink-0 overflow-hidden">
        {faviconSrc ? (
          <img
            src={faviconSrc}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Disc3 size={18} className="text-slate" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm text-bone font-medium truncate">{station.name}</p>
        <p className="font-ui text-[10px] text-slate uppercase tracking-wider truncate mt-0.5">
          {station.tags?.split(",")[0] || station.country || "Radio"}
        </p>
      </div>

      {/* Frequency */}
      <div className="text-right shrink-0">
        <p className="font-mono text-xs text-slate">
          {station.bitrate ? `${station.bitrate}k` : "??"}k
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            if (fav) {
              favorites.removeFavorite(station.id);
            } else {
              favorites.addFavorite({
                id: station.id,
                name: station.name,
                url: station.url_resolved || station.url,
                favicon: station.favicon,
                country: station.country,
                tags: station.tags,
                addedAt: Date.now(),
              });
            }
          }}
          className="p-1.5 text-slate hover:text-bone transition-colors duration-200"
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={14} className={fav ? "fill-gold text-gold" : ""} />
        </button>
        <button
          onClick={() => onPlay(station)}
          className="p-1.5 text-bone hover:text-gold transition-colors duration-200"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </div>
  );
}
