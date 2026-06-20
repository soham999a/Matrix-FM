import { useState, useCallback } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { REGIONS } from "../data/regions";
import { useRegionStations } from "../hooks/useRadioStations";
import { StationCard } from "./StationCard";
import { SearchSheet } from "./SearchSheet";
import { Search, TrendingUp } from "lucide-react";
import { EDITOR_PICKS } from "../data/editorPicks";

export function StationList() {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0].code);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: stations, isLoading, error } = useRegionStations(activeRegion);
  const { player } = usePlayer();

  const handlePlay = useCallback(
    (station: import("../types/radio").RadioStation) => {
      player.playWithTracking(station);
    },
    [player]
  );

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* Section Header */}
      <div className="px-grid-2 pt-grid-2 pb-grid-1">
        <h2 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase">
          STATIONS
        </h2>
        <div className="w-8 h-[3px] bg-gold/40 mt-grid-1" />
      </div>

      {/* Search Bar */}
      <div className="px-grid-2 pb-grid-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full ink-card rounded-lg px-grid-2 py-grid-1.5 flex items-center gap-2 text-slate hover:text-bone transition-colors"
        >
          <Search size={16} />
          <span className="font-sans text-sm">Search stations...</span>
        </button>
      </div>

      {/* Region Tabs */}
      <div className="overflow-x-auto no-scrollbar px-grid-2">
        <div className="flex gap-1 pb-grid-1">
          {REGIONS.map(region => (
            <button
              key={region.code}
              onClick={() => setActiveRegion(region.code)}
              className={`shrink-0 px-3 py-1.5 rounded-md font-ui text-[11px] tracking-wider transition-colors duration-200 ${
                activeRegion === region.code
                  ? "bg-gold text-ink"
                  : "ink-card text-slate hover:text-bone"
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Station List */}
      <div className="flex-1 overflow-y-auto px-grid-2 pb-grid-2">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-1 pt-grid-2">
            {[1, 2, 3, 4, 5].map(i => (
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

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-grid-6">
            <p className="font-sans text-sm text-slate mb-2">
              Could not load stations
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-grid-2 py-grid-1 rounded-md border border-hairline font-ui text-xs tracking-wider text-bone hover:bg-ink-light transition-colors"
            >
              RETRY
            </button>
          </div>
        )}

        {/* Empty state with editor picks */}
        {!isLoading && !error && stations?.length === 0 && (
          <div className="pt-grid-2">
            <div className="flex items-center gap-2 mb-grid-2">
              <TrendingUp size={14} className="text-gold" />
              <h3 className="font-ui text-[10px] font-bold tracking-[0.1em] text-gold uppercase">
                EDITOR'S PICKS
              </h3>
            </div>
            <div className="flex flex-col gap-1 mb-grid-4">
              {EDITOR_PICKS.map(s => (
                <StationCard
                  key={s.id}
                  station={s}
                  isActive={player.currentStation?.id === s.id}
                  onPlay={handlePlay}
                />
              ))}
            </div>
            <div className="flex flex-col items-center py-grid-4">
              <p className="font-sans text-xs text-slate">
                No stations available for this region
              </p>
            </div>
          </div>
        )}

        {/* Stations */}
        {!isLoading && stations && stations.length > 0 && (
          <div className="flex flex-col gap-1 pt-grid-2">
            {stations.map(station => (
              <StationCard
                key={station.id}
                station={station}
                isActive={player.currentStation?.id === station.id}
                onPlay={handlePlay}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search Sheet */}
      <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
